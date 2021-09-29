const { v4: uuid } = require("uuid");
const { MongoClient } = require("mongodb");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;
const express = require("express");
const pino = require("pino");
const expressPino = require("express-pino-logger");
const { StatusCodes } = require("http-status-codes");

const app = express();
app.use(express.json());
const log = pino({ level: process.env.LOG_LEVEL || "info", redact: ["password", "newPassword", "req.headers.authorization"], censor: ["**secret**"] });

log.info("Order API Starting");


const expressLogger = expressPino({ logger: log });
app.use(expressLogger);
app.disable("x-powered-by");


let broker = null;
const mongoUrl = `mongodb+srv://root:${process.env.MONGO_PASSWORD}@${process.env.MONGO}`;
log.debug(`Order API - Mongo URL: ${mongoUrl}`);
const mongo = new MongoClient(mongoUrl);
let db = null;
let storedOrders = null;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST");

    if (req.method === "OPTIONS") return res.status(StatusCodes.OK).json({});

    next();
});

app.get("/", (req, res) => {
    const orders = storedOrders.find({}).toArray();
    res.send(orders);
});

app.post("/store", async(req, res) => {
    const event = req.body;
    const order = event.data;
    storedOrders.insertOne(order);
    res.sendStatus(201);
});

app.post("/create", async(req, res) => {
    const body = req.body;
    const id = uuid();
    const timestamp = Date.now();

    const event = {
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
            user: body.username
        },
        prevData: null
    };

    log.debug("Submitting event: ");
    try {
        await broker.publish(event);
    } catch (err) {
        res.status(500).send(JSON.stringify({ message: "Couldn't publish event", cause: err }));
    }
});

const registerBroker = () => {
    log.debug(`OrderApi connecting to redis`);

    const redisClient = new Redis({
        port: 6379,
        host: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        db: 0
    });

    broker = new brokerType(redisClient, "orders");
};

const connectToMongo = async() => {
    log.debug(`OrderApi connecting to mongo`);
    await mongo.connect();
    log.debug(`OrderApi connected to mongo`);
    db = client.db(storedOrders);
    storedOrders = db.collection("documents");
};

registerBroker();
await connectToMongo();

log.debug("Order API ready");
app.listen(80);