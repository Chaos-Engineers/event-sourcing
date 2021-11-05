const chalk = require("chalk");
const { v4: uuid } = require("uuid");
const { MongoClient } = require("mongodb");
const ObjectID = require("mongodb").ObjectID;
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const express = require("express");
const { StatusCodes: sc } = require("http-status-codes");

const app = express();
app.use(express.json());

console.info(chalk.bold.magenta("Orders API starting"));

app.disable("x-powered-by");

let broker = null;
const mongo = new MongoClient(`mongodb://root:${process.env.MONGO_PASSWORD}@${process.env.MONGO}`);

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

app.get("/:id", async (req, res) => {
  console.log(`Getting a single order`);
  try {
    const id = req.params.id;
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    res.send(order);
  } catch (err) {
    const e = { message: `Error finding stored order id: ${id}`, cause: err };
    console.error(e);
    res.status(sc.INTERNAL_SERVER_ERROR).send(e);
  }
});

app.put("/received", async (req, res) => {
  console.log(chalk.green("Order received"));
  const order = req.body;
  console.dir(order);
  console.log(chalk.cyan(`Updating order in db: ${order.id}`));

  try {
    await ordersCollection.updateOne({ _id: order.id }, { $set: { status: "Validating" } });
    console.log("order status changed");
    res.status(sc.OK).send({ id: order.id });
  } catch (err) {
    console.log("Error: Order not saved");
    console.dir(err);
    res.status(sc.INTERNAL_SERVER_ERROR).send({ id: order.id, ...err });
  }
});

app.put("/resend", async (req, res) => {
  console.log(chalk.green("Order resend"));
  const order = req.body;

  try {
    await ordersCollection.updateOne(
      { _id: order.id },
      {
        $set: {
          status: "Resend",
          data: {
            errors: res.body
          }
        }
      }
    );

    console.log("order status changed");
    res.status(sc.OK).send({ id: order.id });
  } catch (err) {
    console.log("Error: Order not saved");
    console.dir(err);
    res.status(sc.INTERNAL_SERVER_ERROR).send({ id: order.id, ...err });
  }
});

app.put("/valid", async (req, res) => {
  console.log(chalk.green("Order valid"));
  const order = req.body;

  try {
    await ordersCollection.updateOne(
      { _id: order.id },
      {
        $set: {
          status: "Valid",
          data: {
            errors: null
          }
        }
      }
    );

    console.log("order status changed");
    res.status(sc.OK).send({ id: order.id });
  } catch (err) {
    console.log("Error: Order not saved");
    console.dir(err);
    res.status(sc.INTERNAL_SERVER_ERROR).send({ id: order.id, ...err });
  }
});

app.put("/invalid", async (req, res) => {
  console.log(chalk.green("Order invalid"));
  const order = req.body;

  try {
    await ordersCollection.updateOne(
      { _id: order.id },
      {
        $set: {
          status: "Invalid",
          data: {
            errors: res.body
          }
        }
      }
    );

    console.log("Order status changed");
    res.status(sc.OK).send({ id: order.id });
  } catch (err) {
    console.log("Error: Order not saved");
    console.dir(err);
    res.status(sc.INTERNAL_SERVER_ERROR).send({ id: order.id, ...err });
  }
});

app.put("/authorised", async (req, res) => {
  console.log(chalk.green("Order authorised"));
  const order = req.body;

  try {
    await ordersCollection.updateOne(
      { _id: order.id },
      {
        $set: {
          status: "Authorised",
          data: {
            errors: null
          }
        }
      }
    );

    console.log("Order status changed");
    res.status(sc.OK).send({ id: order.id });
  } catch (err) {
    console.log("Error: Order not saved");
    console.dir(err);
    res.status(sc.INTERNAL_SERVER_ERROR).send({ id: order.id, ...err });
  }
});

app.put("/unauthorised", async (req, res) => {
  console.log(chalk.green("Order valid"));
  const order = req.body;

  try {
    await ordersCollection.updateOne(
      { _id: order.id },
      {
        $set: {
          status: "Unauthorised",
          data: {
            errors: req.body
          }
        }
      }
    );

    console.log("Order status changed");
    res.status(sc.OK).send({ id: order.id });
  } catch (err) {
    console.log("Error: Order not saved");
    console.dir(err);
    res.status(sc.INTERNAL_SERVER_ERROR).send({ id: order.id, ...err });
  }
});

app.put("/shipped", async (req, res) => {
  console.log(chalk.green("Order shipped"));
  const order = req.body;

  try {
    await ordersCollection.updateOne(
      { _id: order.id },
      {
        $set: {
          status: "Valid",
          data: {
            errors: null
          }
        }
      }
    );

    console.log("Order status changed");
    res.status(sc.OK).send({ id: order.id });
  } catch (err) {
    console.log("Error: Order not saved");
    console.dir(err);
    res.status(sc.INTERNAL_SERVER_ERROR).send({ id: order.id, ...err });
  }
});

app.put("/cancelled", async (req, res) => {
  console.log(chalk.green("Order valid"));
  const order = req.body;

  try {
    await ordersCollection.updateOne(
      { _id: order.id },
      {
        $set: {
          status: "Cancelled",
          data: {
            errors: req.body
          }
        }
      }
    );

    console.log("Order status changed");
    res.status(sc.OK).send({ id: order.id });
  } catch (err) {
    console.log("Error: Order not saved");
    console.dir(err);
    res.status(sc.INTERNAL_SERVER_ERROR).send({ id: order.id, ...err });
  }
});

app.post("/", async (req, res) => {
  console.log(chalk.green("Order submitted"));
  const body = req.body;
  console.dir(body);
  const id = uuid();
  const timestamp = `${Date.now()}`;

  const order = {
    id: id,
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
  };

  const event = {
    id: id,
    source: "api.order.neworder",
    type: "order.submitted.1",
    event: "order.submitted.1",
    ctx: body.ctx || uuid(),
    time: timestamp,
    data: order
  };

  try {
    console.dir({ action: "Storing order", event });
    await ordersCollection.insertOne({ _id: event.data.id, ...event.data });

    try {
      console.log("Publishing order submitted event");
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
