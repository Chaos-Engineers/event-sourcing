const fs = require("fs");
const got = require("got");
const { v4: uuid } = require("uuid");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const pino = require("pino");
const chalk = require("chalk");

const log = pino({ level: process.env.LOG_LEVEL || "debug", redact: ["password", "newPassword", "req.headers.authorization"], censor: ["**secret**"] });

console.info(chalk.bold.magentaBright("Adaptor Starting..."));

const eventServiceMap = {};
let consumerGroup = null;
let subscriptionHandle = null;

const readAndProcessEventMappings = () => {
  console.debug(`Adaptor reading properties`);

  const eventServiceEventRaw = fs.readFileSync(fs.realpathSync("/registry/event-service-event"), "utf8");
  eventServiceEventRaw.split("\n").forEach(line => {
    if (line.indexOf("|") === -1) return;
    let [input, svc, output, error] = line.split("|");
    input = input.trim();
    svc = svc.trim();
    output = output.trim();
    error = error.trim();
    const [_namespace, service, endpoint] = svc.split(".");
    const namespace = _namespace.startsWith("+") ? _namespace.substring(1) : _namespace;
    const src = `${service}.${namespace}/${endpoint || ""}`;
    const source = src.endsWith("/") ? src.substring(0, src.length - 1) : src;
    if (!eventServiceMap.hasOwnProperty(input)) eventServiceMap[input] = [];
    eventServiceMap[input].push({ source, url: `http://${service}.${namespace}.svc.cluster.local/${endpoint || input}`, output, put: _namespace.startsWith("+"), error: error });
  });
  
  console.dir({ routes: eventServiceMap });
};

const joinAndSubscribe = async () => {
  console.info(chalk.yellow(`Adaptor connecting to redis...`));

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
      const payload = JSON.parse(element.payload.event);
      let prevResult = null;

      for (const mapping of eventServiceMap[payload.type]) {
        console.dir({ Mapping: mapping });
        console.info(chalk`Handling {green ${mapping.source}} by calling {cyan ${mapping.url}}`);

        const { body: result, statusCode } = mapping.put //
          ? await got.put(mapping.url, { json: { payload } })
          : await got.post(mapping.url, { json: { payload: payload } });
        
          console.info(chalk`Status {green ${statusCode}}`);

        if (statusCode < 200 || statusCode >= 299) {
          if (mapping.error) {
            console.info(chalk`Sending {red err} response to url: {cyan ${mapping.error}}`);
        
            await got.post(mapping.error, { json: { payload, result, statusCode } });
          } else {
            console.error(chalk.red(`Unhandled Error sending event to ${mapping.url} : Response ${statusCode}`));
          }
        } else if ((statusCode === 200 || statusCode === 201) && mapping.output !== "-") {
          const id = uuid();
          console.info(chalk`Publishing {green event} to bus ({cyan id: ${id}})`);

          const event = {
            id: id,
            source: mapping.source,
            type: mapping.output,
            ctx: payload.ctx || id,
            time: Date.now(),
            data: { ...result },
            prevData: JSON.stringify(prevResult)
          };

          await broker.publish({ event: JSON.stringify(event) });
          prevResult = result;
        }
      }

      await element.markAsRead();
    } catch (err) {
      console.error(chalk.red(JSON.stringify(err)));
    }
  };

  console.info(chalk.yellow(`Adaptor ${adaptorName} joining consumer group: ${consumerGroupName}`));
  consumerGroup = await broker.joinConsumerGroup(consumerGroupName);
  console.info(chalk.yellow(`Adaptor subscribing as ${adaptorName}`));
  subscriptionHandle = await consumerGroup.subscribe(adaptorName, handleEvent, pollSpan, payloadsToFetch, readPending);
};

readAndProcessEventMappings();
joinAndSubscribe();

process.on("SIGTERM", () => {
  console.info(chalk.red(`SIGTERM signal received in adaptor: ${adaptorName}`));
  if (consumerGroup && subscriptionHandle) consumerGroup.unsubscribe(subscriptionHandle);
  process.exit(0);
});

console.info(chalk.bold.magenta(`Adaptor ready`));
