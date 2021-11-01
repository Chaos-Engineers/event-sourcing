const fs = require("fs");
const got = require("got");
const { v4: uuid } = require("uuid");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const pino = require("pino");
const chalk = require("chalk");

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

const headers = name => `
const chalk = require("chalk");
const { v4: uuid } = require("uuid");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
const app = express();
app.use(express.json());

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST");

  if (req.method === "OPTIONS") return res.status(StatusCodes.OK).json({});

  next();
});

console.log(chalk.bold.magenta("${name} starting..."));


`;
const log = pino({ level: process.env.LOG_LEVEL || "debug", redact: ["password", "newPassword", "req.headers.authorization"], censor: ["**secret**"] });

console.info(chalk.bold.magentaBright("Event Adaptor Starting..."));

const eventEndpointMap = {};
let consumerGroup = null;
let subscriptionHandle = null;

const readAndProcessEventMappings = () => {
  const eventEndpointEventRaw = fs.readFileSync(fs.realpathSync("/registry/event-endpoint-event"), "utf8");

  eventEndpointEventRaw.split("\n").forEach(line => {
    if (line.indexOf("|") === -1) return;
    let [input, svc, output, error] = line.split("|");
    input = input.trim();
    svc = svc.trim();
    const endpoint = svc.startsWith("+") && svc.length > 1 ? svc.substring(1) : svc;
    if (!eventEndpointMap.hasOwnProperty(input)) eventEndpointMap[input] = [];
    eventEndpointMap[input].push({
      source: process.env.SERVICE,
      url: `http://localhost/${endpoint || input}`,
      output: output.trim(),
      put: svc.startsWith("+"),
      error: error.trim(),
      endpoint
    });
  });

  const endpointEvent = {};

  console.log(chalk.red("Event Map"));
  Object.keys(eventEndpointMap).forEach(event => {
    const handlers = eventEndpointMap[event];
    handlers.forEach(handler => {
      console.log(
        chalk`{cyan ${event}} -> {red ${handler.endpoint}} ${handler.output !== "-" ? "-> " + chalk.green(handler.output) : ""}` //
      );

      if (!endpointEvent.hasOwnProperty(handler.endpoint)) endpointEvent[handler.endpoint] = [];
      endpointEvent[handler.endpoint].push({
        output: handler.output,
        error: handler.error,
        put: handler.put
      });
    });
  });
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

      for (const mapping of eventEndpointMap[payload.type]) {
        console.dir({ Mapping: mapping });
        console.info(chalk`Handling {green ${mapping.source}} by calling {cyan ${mapping.url}}`);
        try {
          const result = mapping.put //
            ? await got.put(mapping.url, { json: { ...payload.data } }).json()
            : await got.post(mapping.url, { json: { ...payload.dataa } }).json();

          if (mapping.output !== "-") {
            const id = uuid();
            console.info(chalk`Publishing {green event} to bus ({cyan id: ${id}})`);

            const event = {
              id: id,
              source: mapping.source,
              type: mapping.output,
              ctx: payload.ctx || id,
              time: Date.now(),
              data: result
            };

            await broker.publish({ event: JSON.stringify(event) });
          }
        } catch (err) {
          if (mapping.error) {
            console.info(chalk`Sending {red ${err}} response to url: {cyan ${mapping.error}}`);

            await got.post(mapping.error, { json: { payload: payload.data, result } });
          } else {
            console.error(chalk.red(`Unhandled Error sending event to ${mapping.url} : Response: ${result}`));
          }
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

console.info(chalk.bold.magenta(`Event Adaptor ready`));
