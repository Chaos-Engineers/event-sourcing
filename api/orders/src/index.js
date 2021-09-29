console.log("Order API");
const express = require("express");
const { v4: uuid } = require("uuid");
const { MongoClient } = require("mongodb");
const Redis = require("ioredis");
const brokerType = require("redis-streams-broker").StreamChannelBroker;

const mongoUrl = `mongodb+srv://root:${process.env.MONGO_PASSWORD}@${process.env.MONGO}`;
console.log(`Order API - Mongo URL: ${mongoUrl}`);
const mongo = new MongoClient(mongoUrl);
let db = null;
let storedOrders = null;

const app = express();
app.use(express.json());
let broker = null;

app.get("/", (req, res) => {
    const orders = storedOrders.find({}).toArray();
    res.send(orders);
});

app.post("/store", async(req, res) => {
    const event = req.body;
    const order = event.data;
    storedOrders.insertOne(order);
    res.sendStatus(201)
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

    console.log("Submitting event: ");
    try {
        await broker.publish(event);
    } catch (err) {
        res.status(500).send(JSON.stringify({ message: "Couldn't publish event", cause: err }));
    }
});

const registerBroker = () => {
    console.log(`OrderApi connecting to redis`);

    const redisClient = new Redis({
        port: 6379,
        host: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        db: 0
    });

    broker = new brokerType(redisClient, "orders");
};

const connectToMongo = async() => {
    console.log(`OrderApi connecting to mongo`);
    await mongo.connect();
    console.log(`OrderApi connected to mongo`);
    db = client.db(storedOrders);
    storedOrders = db.collection("documents");
};

registerBroker();
await connectToMongo();

console.log("Order API ready");
app.listen(80);