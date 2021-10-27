const chalk = require("chalk");
const { v4: uuid } = require("uuid");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
// const pino = require("pino");
// const expressPino = require("express-pino-logger");

const app = express();
app.use(express.json());

// const log = pino({ level: process.env.LOG_LEVEL || "info", redact: ["password", "newPassword", "req.headers.authorization"], censor: ["**secret**"] });
console.log(chalk.bold.magenta("Order Service starting..."));

// const expressLogger = expressPino({ logger: log });
// app.use(expressLogger);
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST");

  if (req.method === "OPTIONS") return res.status(StatusCodes.OK).json({});

  next();
});

const validateOrder = order => {
  // console.log(order);
  const errors = [];
  if (!order.customerId) {
    errors.push("Customer is required");
  }

  if (!order?.user) {
    errors.push("Email is required");
  }

  if (!order.items?.length > 0) {
    errors.push("Items is required");
  }

  return errors;
};

app.post("/submitted", (req, res) => {
  console.log(chalk.magenta("Creating order..."));
  return res.send({ ...req.body, orderId: uuid() });
});

app.post("/validate", (req, res) => {
  console.log(chalk.magenta("Validating order..."));
  // const errors = validateOrder(req.body.payload.data);
  const errors = [];
  console.log(errors.length === 0 ? chalk.green("Order is valid") : chalk.red(`Order is invalid with ${errors.length} errors | ${JSON.stringify(errors)}`));
  if (errors.length === 0) return res.status(StatusCodes.OK).send(req.body);
  return res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(errors);
});

app.post("/authorise", (req, res) => {
  console.log(chalk.magenta("Authorising order..."));
  return res.send({ ...req.body, orderId: uuid() });
});

app.post("/fulfil", (req, res) => {
  console.log(chalk.magenta("Fulfilling order..."));
  const order = req.body;
  return res.send({ ...req.body, status: "fulfilled", consignments: { count: 3, shipped: 0, received: 0 } });
});

app.post("/ship", (req, res) => {
  console.log(chalk.magenta("Shipping order..."));
  const order = req.body;
  if (order.consignments.shipped < order.consignments.count)
    return {
      ...order,
      status: "shipping",
      consignments: { ...consignments, ship: order.consignments.ship + 1 }
    };
  return res.send({ ...order, status: `shipped`, shipConsignment: -1 });
});

app.post("/receive", (req, res) => {
  console.log(chalk.magenta("Receiving order..."));
  const order = req.body;
  if (order.received_consignments < order.consignments) return { ...order, status: "received_consignment", consignments: { ...consignments, received: order.consignments.received + 1 } };
  return res.send({ ...req.body, status: "received" });
});

app.post("/cancel", (req, res) => {
  console.log(chalk.magenta("Cancelling order..."));
  const order = req.body;
  if (order.consignments.ship > 0) {
    res.status(StatusCodes.CONFLICT).send({ ...order, status: "aborting cancellation", notes: "Cannot cancel as part of order has been shipped" });
  }
  return res.send({ ...req.body, status: "cancelled" });
});

app.post("/approve", (req, res) => {
  console.log(chalk.magenta("Approving order..."));
  return res.send({ ...req.body, status: "approved" });
});

app.listen(80);
console.log(chalk.bold.magenta("Order Service ready"));
