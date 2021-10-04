const { v4: uuid } = require("uuid");
const { MongoClient } = require("mongodb");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const express = require("express");
const pino = require("pino");
const expressPino = require("express-pino-logger");
const { StatusCodes: sc } = require("http-status-codes");

const app = express();
app.use(express.json());
const log = pino({ level: process.env.LOG_LEVEL || "debug", redact: ["password", "newPassword", "req.headers.authorization"], censor: ["**secret**"] });

log.info("Order API Starting");

const expressLogger = expressPino({ logger: log });
app.use(expressLogger);
app.disable("x-powered-by");

let broker = null;
const mongoUrl = `mongodb://root:${process.env.MONGO_PASSWORD}@${process.env.MONGO}`;
const mongo = new MongoClient(mongoUrl);

let db = null;
let storedOrders = null;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST");

    if (req.method === "OPTIONS") return res.status(sc.OK).json({});

    next();
});

app.get("/", async(req, res) => {
    try {
        const orders = await storedOrders.find({});
        res.send(orders ? orders.toArray() : []);
    } catch (err) {
        const e = { message: "Error finding stored orders", cause: err };
        log.error(e);
        res.status(sc.INTERNAL_SERVER_ERROR).send(e);
    }
});

app.put("/", async(req, res) => {
    const event = req.body.data;
    const id = event.id;
    const type = event.type;
    const errors = event.errors;

    switch (type) {
        case "order.validated.1":
            await storedOrders.updateOne({ _id: id }, { $set: { "data.status": "Validated", "data.errors": null } });
            res.status(sc.OK).send();
            break;
        case "order.invalid.1":
            await storedOrders.updateOne({ _id: id }, { $set: { "data.errors": errors, "data.status": "Invalid" } });
            res.status(sc.OK).send();
            break;
        case "order.authorised.1":
            await storedOrders.updateOne({ _id: id }, { $set: { "data.errors": errors, null: "Authorised" } });
            res.status(sc.OK).send();
            break;
        case "order.shipped.1":
            await storedOrders.updateOne({ _id: id }, { $set: { "data.errors": errors, null: "Shipped" } });
            res.status(sc.OK).send();
            break;
        case "order.cancelled.1":
            await storedOrders.updateOne({ _id: id }, { $set: { "data.errors": errors, null: "Cancelled" } });
            res.status(sc.OK).send();
            break;
    }
});

app.post("/", async(req, res) => {
    const body = req.body;
    log.debug(JSON.stringify(body));
    const id = uuid();
    const timestamp = Date.now();

    const event = {
        _id: id,
        id: id,
        source: "api.order.create",
        type: "order.submitted.1",
        event: null,
        ctx: null,
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
            errors: null
        },
        prevData: null
    };

    try {
        log.debug(`Storing order: ${JSON.stringify(event)}`);
        await storedOrders.insertOne(event);

        try {
            delete event._id;
            // log.debug(`Submitting event: ${JSON.stringify(event)}`);
            // console.log(`Broker`);
            // console.dir(broker);
            await broker.publish(event);
            // log.debug(`Updating order: ${JSON.stringify(event)}`);
            await storedOrders.updateOne({ _id: id }, { $set: { status: "Validating" } });
        } catch (err) {
            log.error({ message: "Error submitting event", cause: err });
            res.status(sc.INTERNAL_SERVER_ERROR).send(JSON.stringify({ message: "Couldn't publish event", cause: err }));
        }
    } catch (err) {
        const e = { message: "Error storing order", cause: err };
        log.error(e);
        res.status(sc.INTERNAL_SERVER_ERROR).send(e);
    }
});

const registerBroker = () => {
    try {
        log.debug(`OrderApi connecting to redis`);

        const redisClient = new Redis({
            port: 6379,
            host: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD,
            db: 0
        });

        broker = new brokerType(redisClient, "orders");
    } catch (err) {
        log.error({ message: "Error connecting to redis", cause: err });
        process.exit(1);
    }
};

const connectToMongo = async() => {
    try {
        log.debug(`OrderApi connecting to mongo`);
        client = await mongo.connect();
        log.info(`OrderApi connected to mongo`);
        db = client.db(storedOrders);
        storedOrders = db.collection("documents");
    } catch (err) {
        log.error({ message: "Error connecting to mongo", cause: err });
        process.exit(1);
    }
};

process.on("SIGTERM", () => {
    log.info(`SIGTERM signal received in adaptor: ${adaptorName}`);
    if (consumerGroup && subscriptionHandle) consumerGroup.unsubscribe(subscriptionHandle);
    process.exit(0);
});

registerBroker();
connectToMongo();

log.debug("Order API ready");
app.listen(80);