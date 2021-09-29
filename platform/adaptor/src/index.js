const fs = require("fs");
const got = require("got");
const { v4: uuid } = require("uuid");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const pino = require("pino");

const log = pino({ level: process.env.LOG_LEVEL || "info", redact: ["password", "newPassword", "req.headers.authorization"], censor: ["**secret**"] });

log.info("Adaptor Starting");

const eventServiceMap = {};
let consumerGroup = null;
let subscriptionHandle = null;

const readAndProcessEventMappings = () => {
    log.debug(`Adaptor reading properties`);
    const eventServiceEventRaw = fs.readFileSync(fs.realpathSync("/registry/event-service-event"), "utf8");
    eventServiceEventRaw.split("\n").forEach(line => {
        if (line.indexOf("|") === -1) return;
        const [input, svc, output] = line.split("|");
        const [namespace, service, endpoint] = svc.split(".");
        const fqn = `${service}.${namespace}/${endpoint}`;
        if (!eventServiceMap.hasOwnProperty(input)) eventServiceMap[input] = [];
        eventServiceMap[input].push({ fqn, url: `http://${service}.${namespace}.svc.cluster.local/${endpoint}`, output });
    });
};

const joinAndSubscribe = async() => {
    log.debug(`Adaptor connecting to redis`);

    const redisClient = new Redis({
        port: 6379,
        host: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        db: 0
    });

    const qName = "orders";
    const broker = new brokerType(redisClient, qName);

    const adaptorName = `adaptor-${uuid()}`;
    const pollSpan = 1; // ms
    const payloadsToFetch = 1;
    const readPending = true;
    const consumerGroupName = "order-adaptors";

    const handleEvent = async payloads => {
        try {
            const element = payloads[0];
            const payload = element.payload;
            let prevResult = null;

            for (const mapping of eventServiceMap[payload.type]) {
                const { body: result, statusCode } = await got.post(mapping.url, { json: { payload: payload } });

                if (statusCode < 200 || statusCode >= 299) {
                    log.debug(`Error sending event to ${mapping.url} : Response ${statusCode}`);
                } else if (statusCode === 200 || statusCode === 201) {
                    const eventType = serviceEmits[mapping.fqn];
                    const id = uuid();

                    const event = {
                        id: id,
                        source: mapping.fqn,
                        type: eventType,
                        ctx: payload.ctx || id,
                        time: Date.now(),
                        data: {...result },
                        prevData: JSON.stringify(prevResult)
                    };

                    await broker.publish(event);
                    prevResult = result;
                }
            }

            await element.markAsRead();
        } catch (err) {
            log.error(err);
        }
    };

    log.info(`Adaptor ${adaptorName} joining consumer group: ${consumerGroupName}`);
    consumerGroup = await broker.joinConsumerGroup(consumerGroupName);
    log.debug(`Adaptor subscribing as ${adaptorName}`);
    subscriptionHandle = await consumerGroup.subscribe(adaptorName, handleEvent, pollSpan, payloadsToFetch, readPending);
    log.debug(`Adaptor ready`);
};

readAndProcessEventMappings();
joinAndSubscribe();

process.on("SIGTERM", () => {
    log.info(`SIGTERM signal received in adaptor: ${adaptorName}`);
    if (consumerGroup && subscriptionHandle) consumerGroup.unsubscribe(subscriptionHandle);
    process.exit(0);
});