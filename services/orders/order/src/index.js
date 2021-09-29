const { v4: uuid } = require("uuid");
const express = require("express");
const pino = require("pino");
const expressPino = require("express-pino-logger");
const { StatusCodes } = require("http-status-codes");

const app = express();
app.use(express.json());

const log = pino({ level: process.env.LOG_LEVEL || "info", redact: ["password", "newPassword", "req.headers.authorization"], censor: ["**secret**"] });
log.info("Order Service starting");

const expressLogger = expressPino({ logger: log });
app.use(expressLogger);
app.disable("x-powered-by");

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST");

    if (req.method === "OPTIONS") return res.status(StatusCodes.OK).json({});

    next();
});

const validateOrder = order => {
    const errors = [];
    if (!order.name) {
        errors.push("Name is required");
    }

    if (!order.customer) {
        errors.push("Customer is required");
    }

    if (!order.email) {
        errors.push("Email is required");
    }

    if (!order.items) {
        errors.push("Items is required");
    }

    return errors;
};

app.post("/validate", (req, res) => {
    const errors = validateOrder(req.body);
    if (errors.length === 0) return res.status(StatusCodes.OK).send(req.body);
    return res.status(StatusCodes.BAD_REQUEST).send(errors);
});

app.post("/create", (req, res) => {
    return res.send({...req.body, orderId: uuid(), status: "new" });
});

app.post("/fulfil", (req, res) => {
    const order = req.body;
    return res.send({...req.body, status: "fulfilled", consignments: { count: 3, shipped: 0, received: 0 } });
});

app.post("/ship", (req, res) => {
    const order = req.body;
    if (order.consignments.shipped < order.consignments.count) return {...order, status: "shipping", consignments: {...consignments, ship: order.consignments.ship + 1 } };
    return res.send({...order, status: `shipped`, shipConsignment: -1 });
});

app.post("/receive", (req, res) => {
    const order = req.body;
    if (order.received_consignments < order.consignments) return {...order, status: "received_consignment", consignments: {...consignments, received: order.consignments.received + 1 } };
    return res.send({...req.body, status: "received" });
});

app.post("/cancel", (req, res) => {
    const order = req.body;
    if (order.consignments.ship > 0) {
        res.status(StatusCodes.CONFLICT).send({...order, status: "aborting cancellation", notes: "Cannot cancel as part of order has been shipped" });
    }
    return res.send({...req.body, status: "cancelled" });
});

app.post("/approve", (req, res) => {
    return res.send({...req.body, status: "approved" });
});

app.listen(80);