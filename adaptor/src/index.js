console.log("Adaptor Starting");

const fs = require("fs");
const got = require("got");
const { v4: uuid } = require("uuid");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;

const serviceEmits = {};
const eventsTrigger = {};

const readAndProcessProperties = () => {
  console.log(`Adaptor reading properties`);
  const serviceEmitsRaw = fs.readFileSync(fs.realpathSync("/registry/service-emits-event.properties"), "utf8");
  const eventsTriggerRaw = fs.readFileSync(fs.realpathSync("/registry/event-consumedby-service.properties"), "utf8");

  serviceEmitsRaw.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    serviceEmits[key] = value;
  });

  eventsTriggerRaw.split("\n").forEach(line => {
    if (line.trim().length !== 0) {
      const [key, value] = line.split("=");
      const [namespace, service, endpoint] = value.split(".");
      const svc = { fqn: value, url: `http://${namespace}.${service}/${endpoint}` };

      if (eventsTrigger.hasOwnProperty(key)) {
        eventsTrigger[key].push(svc);
      } else {
        eventsTrigger[key] = [svc];
      }
    }
  });
};

const joinAndSubscribe = async () => {

  console.log(`Adaptor connecting to redis`);
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

  const handler = async payloads => {
    try {
      const element = payloads[0];
      const payload = element.payload;
      let prevResult = null;

      for (const svc of eventsTrigger[payload.type]) {
        const { body: result, statusCode } = await got.post(svc.url, { json: { payload: payload } });

        if (statusCode < 200 || statusCode >= 299) {
          console.log(`Error sending event to ${svc.url} : Response ${statusCode}`);
        } else if (statusCode === 200 || statusCode === 201) {
          const emitEvent = serviceEmits[svc.fqn];
          await broker.publish({
            id: uuid(),
            source: svc.fqn,
            type: emitEvent,
            ctx: payload.ctx,
            time: Date.now(),
            data: JSON.stringify(result),
            event: null,
            prevData: JSON.stringify(prevResult)
          });
          prevResult = result;
        }
      }

      await element.markAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  console.log(`Adaptor joining consumer group: ${consumerGroupName}`);
  const consumerGroup = await broker.joinConsumerGroup(consumerGroupName);
  console.log(`Adaptor subscribing as ${adaptorName}`);
  const subscriptionHandle = await consumerGroup.subscribe(adaptorName, handler, pollSpan, payloadsToFetch, readPending);
  console.log(`Adaptor ready`);
};

readAndProcessProperties();
joinAndSubscribe();

//Unsubscribes the consumer from the group.
// const success = consumerGroup.unsubscribe(subscriptionHandle);

