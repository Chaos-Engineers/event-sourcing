const chalk = require("chalk");
const { v4: uuid } = require("uuid");
const { MongoClient } = require("mongodb");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const express = require("express");
// const pino = require("pino");
// const expressPino = require("express-pino-logger");
const { StatusCodes: sc } = require("http-status-codes");

const app = express();
app.use(express.json());
// const log = pino({ level: process.env.LOG_LEVEL || "debug", redact: ["password", "newPassword", "req.headers.authorization"], censor: ["**secret**"] });

console.info(chalk.bold.magenta("Orders API starting..."));

// const expressLogger = expressPino({ logger: log });
// app.use(expressLogger);
app.disable("x-powered-by");

let broker = null;
const mongoUrl = `mongodb://root:${process.env.MONGO_PASSWORD}@${process.env.MONGO}`;
const mongo = new MongoClient(mongoUrl);

let db = null;
let ordersCollection = null;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST");

  if (req.method === "OPTIONS") return res.status(sc.OK).json({});

  next();
});

app.get("/", async (req, res) => {
  try {
    const orders = await ordersCollection.find();
    const allOrders = orders ? await orders.toArray() : [];
    res.send(allOrders);
  } catch (err) {
    const e = { message: "Error finding stored orders", cause: err };
    console.error(e);
    res.status(sc.INTERNAL_SERVER_ERROR).send(e);
  }
});

app.put("/received", async (req, res) => {
  await ordersCollection.updateOne({ _id: id }, { $set: { "data.status": "Received", "data.errors": null } });
  res.sendStatus(sc.OK);
});

app.put("/resend", async (req, res) => {
  await ordersCollection.updateOne({ _id: id }, { $set: { "data.status": "Resend", "data.errors": res.body } });
  res.sendStatus(sc.OK);
});

app.put("/valid", async (req, res) => {
  await ordersCollection.updateOne({ _id: id }, { $set: { "data.status": "Valid", "data.errors": null } });
  res.sendStatus(sc.OK);
});

app.put("/invalid", async (req, res) => {
  await ordersCollection.updateOne({ _id: id }, { $set: { "data.status": "Invalid", "data.errors": req.body } });
  res.sendStatus(sc.OK);
});

app.put("/authorised", async (req, res) => {
  await ordersCollection.updateOne({ _id: id }, { $set: { "data.status": "Authorised", "data.errors": null } });
  res.sendStatus(sc.OK);
});

app.put("/unauthorised", async (req, res) => {
  await ordersCollection.updateOne({ _id: id }, { $set: { "data.status": "Unauthorised", "data.errors": req.body } });
  res.sendStatus(sc.OK);
});

app.post("/", async (req, res) => {
  const body = req.body;
  console.dir(body);
  const id = uuid();
  const timestamp = `${Date.now()}`;

  const event = {
    id: id,
    source: "api.order.neworder",
    type: "order.submitted.1",
    event: "order.submitted.1",
    ctx: body.ctx || uuid(),
    time: timestamp,
    data: {
      customerId: body.customerId,
      items: body.items,
      address: body.address,
      purchaseOrder: body.po,
      quotedPrice: body.price,
      quotedCurrency: body.currency,
      quotedDeliveryDate: body.deliveryDate,
      time: timestamp,
      status: "Submitting",
      user: body.username,
      errors: []
    }
  };

  try {
    console.dir({ action: "Storing order", event });
    await ordersCollection.insertOne({ _id: event.id, ...event.data });

    try {
      await broker.publish({ event: JSON.stringify(event) });
      res.sendStatus(sc.CREATED);
    } catch (err) {
      console.error({ message: "Error publishing event", cause: err });
      res.status(sc.INTERNAL_SERVER_ERROR).send(JSON.stringify({ message: "Couldn't publish event", cause: err }));
    }

  } catch (err) {
    const e = { message: "Error storing order", cause: err };
    console.error(e);
    res.status(sc.INTERNAL_SERVER_ERROR).send(e);
  }
});

const registerBroker = () => {
  try {
    console.debug(`OrderApi connecting to redis`);

    const redisClient = new Redis({
      port: 6379,
      host: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
      db: 0
    });

    broker = new brokerType(redisClient, "orders");
  } catch (err) {
    console.error({ message: "Error connecting to redis", cause: err });
    process.exit(1);
  }
};

const connectToMongo = async () => {
  try {
    console.debug(`OrderApi connecting to mongo`);
    client = await mongo.connect();
    console.info(`OrderApi connected to mongo`);
    db = client.db("api-orders");
    ordersCollection = db.collection("orders");
  } catch (err) {
    console.error({ message: "Error connecting to mongo", cause: err });
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  console.info(`SIGTERM signal received in adaptor: ${adaptorName}`);
  if (consumerGroup && subscriptionHandle) consumerGroup.unsubscribe(subscriptionHandle);
  process.exit(0);
});

registerBroker();
connectToMongo();

app.listen(80);
console.info(chalk.bold.magenta("Orders API ready"));
