const fs = require("fs");
const got = require("got");
const { v4: uuid } = require("uuid");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const chalk = require("chalk");

console.info(chalk.bold.magentaBright("Event Adaptor Starting..."));

const eventEndpointMap = {};
const eventLog = [];
let consumerGroup = null;
let subscriptionHandle = null;
let broker = null;

const readAndProcessEventMappings = () => {
  const eventEndpointEventRaw = fs.readFileSync(fs.realpathSync("/registry/event-endpoint-event"), "utf8");

  eventEndpointEventRaw.split("\n").forEach((line, idx) => {
    if (line.indexOf("|") === -1) return;
    let [input, svc, output, error] = line.split("|");
    input = input.trim();
    svc = svc.trim();
    const endpoint = svc.startsWith("+") && svc.length > 1 ? svc.substring(1) : svc;

    if (eventEndpointMap.hasOwnProperty(input)) {
      console.error(`Error: Improper attempt to map ${input} to multiple endpoints detected on line ${idx}. Abending.`);
      process.exit(1);
    }

    eventEndpointMap[input] = {
      input,
      endpoint,
      source: process.env.SERVICE,
      url: `http://localhost/${endpoint || input}`,
      output: output.trim(),
      put: svc.startsWith("+"),
      error: error.trim()
    };
  });

  console.log(chalk.red("Event Map"));
  Object.keys(eventEndpointMap).forEach(event => {
    const handler = eventEndpointMap[event];
    console.log(
      chalk`{cyan ${event}} -> {red ${handler.endpoint}} ${handler.output !== "-" ? "-> " + chalk.green(handler.output) : ""}` //
    );
  });
};

const joinAndSubscribe = async () => {
  console.info(chalk.yellow(`Adaptor connecting to redis...`));
  console.dir({ port: 6379, host: process.env.REDIS_URL, password: process.env.REDIS_PASSWORD, db: 0, service: process.env.SERVICE });

  const redisClient = new Redis({
    port: 6379,
    host: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    db: 0
  });

  const qName = "orders";
  broker = new brokerType(redisClient, qName);

  const adaptorName = `adaptor-${uuid()}`;
  const consumerGroupName = `${process.env.SERVICE}-group`;

  console.info(chalk.yellow(`Adaptor ${adaptorName} joining consumer group: ${consumerGroupName}`));
  consumerGroup = await broker.joinConsumerGroup(consumerGroupName);
  console.info(chalk.yellow(`Adaptor subscribing as ${adaptorName}`));
  subscriptionHandle = await consumerGroup.subscribe(adaptorName, handleEvent, 1, 1, true);
};

const handleEvent = async payloads => {
  try {
    const element = payloads[0];
    const payload = JSON.parse(element.payload.event);

    if (payload.type.startsWith("control")) {
      if (payload.type === "control.map.1") {
        const event = {
          id: uuid(),
          source: process.env.SERVICE,
          type: "report.map.1",
          ctx: payload.ctx,
          time: Date.now(),
          data: eventEndpointMap
        };

        await broker.publish({ event: JSON.stringify(event) });
      } else if (payload.type === "control.log.1") {
        const event = {
          id: uuid(),
          source: process.env.SERVICE,
          type: "report.log.1",
          ctx: payload.ctx,
          time: Date.now(),
          data: eventLog
        };

        await broker.publish({ event: JSON.stringify(event) });
      }
    } else {
      const mapping = eventEndpointMap[payload.type];
      console.info(chalk`Handling {green ${mapping.input}} by calling {cyan ${mapping.url}}`);
      eventLog.push({ type: payload.type, published: payload.timestamp, received: new Date().toISOString() });

      try {
        const results = await (mapping.put //
          ? got.put(mapping.url, { json: { ...payload.data } })
          : got.post(mapping.url, { json: { ...payload.data } })
        ).json();

        if (mapping.output !== "-") {
          const id = uuid();
          console.info(chalk`Publishing {green event} to bus ({cyan id: ${id}})`);

          const event = {
            id: id,
            source: mapping.source,
            type: mapping.output,
            ctx: payload.ctx || id,
            time: Date.now(),
            data: results || payload.data.id
          };

          await broker.publish({ event: JSON.stringify(event) });
        }
      } catch (err) {
        console.log("Handle Event E");
        if (mapping.error) {
          console.info(chalk`Sending {red ${err}} response to url: {cyan ${mapping.error}}`);

          await got.post(mapping.error, { json: { payload: payload.data, result } });
        } else {
          console.error(chalk.red(`Unhandled Error sending event to ${mapping.url} : Response: ${result}`));
        }
      }

      await element.markAsRead();
    }
  } catch (err) {
    console.log("Error: F1");
    console.error(chalk.red(JSON.stringify(err)));
  }
};

readAndProcessEventMappings();
joinAndSubscribe();

process.on("SIGTERM", () => {
  console.info(chalk.red(`SIGTERM signal received in adaptor: ${adaptorName}`));
  if (consumerGroup && subscriptionHandle) consumerGroup.unsubscribe(subscriptionHandle);
  process.exit(0);
});

console.info(chalk.bold.magenta(`Event Adaptor ready`));
