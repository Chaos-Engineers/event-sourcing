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

console.info(chalk.bold.magentaBright("Adaptor Starting..."));

const eventServiceMap = {};
let consumerGroup = null;
let subscriptionHandle = null;

const readAndProcessEventMappings = () => {
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
    eventServiceMap[input].push({
      source,
      url: `http://${service}.${namespace}.svc.cluster.local/${endpoint || input}`,
      output,
      put: _namespace.startsWith("+"),
      error,
      namespace: (_namespace.startsWith("+") ? _namespace.substring(1) : _namespace).replace("contexts-", "services/"),
      service,
      endpoint
    });
  });

  const serviceEndpointEvent = {};

  console.log(chalk.red("Event Map"));
  Object.keys(eventServiceMap).forEach(event => {
    const handlers = eventServiceMap[event];
    handlers.forEach(handler => {
      console.log(
        chalk`{cyan ${event}} -> {red ${handler.namespace.startsWith("contexts") ? "service" : "api"}/${handler.service}.${handler.endpoint}} ${handler.output !== "-" ? "-> " + chalk.green(handler.output) : ""}` //
      );

      if (!serviceEndpointEvent.hasOwnProperty(`${handler.namespace}/${handler.service}`)) serviceEndpointEvent[`${handler.namespace}/${handler.service}`] = [];
      serviceEndpointEvent[`${handler.namespace}/${handler.service}`].push({
        endpoint: handler.endpoint,
        output: handler.output,
        error: handler.error,
        put: handler.put
      });
    });
  });

  console.log(chalk.magenta("Code Generation ----------------------------------------------->"));

  Object.keys(serviceEndpointEvent).forEach(service => {
    console.log(chalk`{blue File:} {red ${service}.js}`);
    console.log(chalk.cyan("npm i chalk express uuid http-status-codes"));
    console.log(chalk.blue(headers(service)));

    serviceEndpointEvent[service].forEach(handler => {
      console.log(
        chalk.cyan(`
const ${handler.endpoint} = event => \{
  \// Business logic for ${handler.endpoint} event handler goes here
  return {
    status: StatusCodes.OK,
    result: "Not implemented"
  };
}`)
      );
    });

    serviceEndpointEvent[service].forEach(handler => {
      console.log(
        chalk.green(`
app.${handler.put ? "put" : "post"}("/${handler.endpoint}", async (req, res) => \{
  const handle${handler.endpoint.capitalize()} = ${handler.endpoint}(req.body);
  return res.status(handle${handler.endpoint.capitalize()}.status).send(\{handle${handler.endpoint.capitalize()}.result});
});`)
      );
    });
  });

  console.log(chalk.magenta("Code Generation Done ------------------------------------------>"));
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

      for (const mapping of eventServiceMap[payload.type]) {
        console.dir({ Mapping: mapping });
        console.info(chalk`Handling {green ${mapping.source}} by calling {cyan ${mapping.url}}`);
        try {
          const result = mapping.put //
            ? await got.put(mapping.url, { json: { ...payload.data } }).json()
            : await got.post(mapping.url, { json: { ...payload.data } }).json();

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

console.info(chalk.bold.magenta(`Adaptor ready`));
