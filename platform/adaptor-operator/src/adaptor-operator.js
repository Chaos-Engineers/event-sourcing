const chalk = require("chalk");
const { v4: uuid } = require("uuid");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const express = require("express");
const { StatusCodes: sc } = require("http-status-codes");

const app = express();
app.use(express.json());

console.info(chalk.bold.magenta("adaptor-operator API starting"));

app.disable("x-powered-by");

let consumerGroup = null;
let subscriptionHandle = null;
let broker = null;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST");

  if (req.method === "OPTIONS") return res.status(sc.OK).json({});

  next();
});

app.post("/:type", async (req, res) => {
  publishEvent(`control.${req.params.type}.1`, res);
});

const publishEvent = async (type, res) => {
  console.log(chalk.green("Publishing to bus"));

  const id = uuid();
  const timestamp = `${Date.now()}`;

  const event = {
    id: id,
    source: "adaptor-operator",
    type,
    event: type,
    ctx: uuid(),
    time: timestamp,
    data: { id }
  };

  try {
    console.log("Publishing control event");
    await broker.publish({ event: JSON.stringify(event) });
    res.sendStatus(sc.OK);
  } catch (err) {
    console.error({ message: "Error publishing event", cause: err });
    res.status(sc.INTERNAL_SERVER_ERROR).send(JSON.stringify({ message: "Couldn't publish event", cause: err }));
  }
};

const handleEvent = async payloads => {
  try {
    const element = payloads[0];
    const payload = JSON.parse(element.payload.event);
    if (!payload.type.startsWith("report")) return;
    console.log(`Operator Report Ready for: ${payload.type} from ${payload.source}...`);
    // console.dir(payload);
    // console.log(`Report:`);
    console.dir(payload.data);
    await element.markAsRead();
  } catch (err) {
    console.log("Adaptor-Operator Error: E1");
    console.error(chalk.red(JSON.stringify(err)));
  }
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
  const adaptorName = `adaptor-operator-${uuid()}`;
  const consumerGroupName = `adaptor-operator-group`;

  console.info(chalk.yellow(`Adaptor ${adaptorName} joining consumer group: ${consumerGroupName}`));
  consumerGroup = await broker.joinConsumerGroup(consumerGroupName);
  console.info(chalk.yellow(`Adaptor ${adaptorName} subscribing to ${qName}`));
  subscriptionHandle = await consumerGroup.subscribe(adaptorName, handleEvent, 1, 1, true);
  console.info(chalk.bold.magenta("adaptor-operator API ready"));
};

process.on("SIGTERM", () => {
  console.info(`SIGTERM signal received in adaptor: ${adaptorName}`);
  if (consumerGroup && subscriptionHandle) consumerGroup.unsubscribe(subscriptionHandle);
  process.exit(0);
});

joinAndSubscribe();
app.listen(80);
