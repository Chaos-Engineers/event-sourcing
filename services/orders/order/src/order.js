const chalk = require("chalk");
const { v4: uuid } = require("uuid");
const express = require("express");
const { StatusCodes } = require("http-status-codes");

const app = express();
app.use(express.json());

console.log(chalk.bold.magenta("Order Service starting..."));

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
  console.dir(req.body);
  return res.status(StatusCodes.OK).send(JSON.stringify({ id: req.body.id }));
});

app.post("/validate", (req, res) => {
  console.log(chalk.magenta("Validating order"));
  console.log(req.body);
  // const errors = validateOrder(req.body.payload.data);
  const errors = [];
  console.log(errors.length === 0 ? chalk.green("Order is valid") : chalk.red(`Order is invalid with ${errors.length} errors | ${JSON.stringify(errors)}`));
  if (errors.length === 0) return res.status(StatusCodes.OK).send({ id: req.body.id });
  return res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(errors);
});

app.post("/authorise", (req, res) => {
  console.log(chalk.magenta("Authorising order..."));
  return res.status(StatusCodes.OK).send({ id: req.body.id });
});

app.post("/fulfil", (req, res) => {
  console.log(chalk.magenta("Fulfilling order..."));
  return res.status(StatusCodes.OK).send({ id: req.body.id });
});

app.post("/ship", (req, res) => {
  console.log(chalk.magenta("Shipping order..."));
  return res.status(StatusCodes.OK).send({ id: req.body.id });
});

app.post("/receive", (req, res) => {
  console.log(chalk.magenta("Receiving order..."));
  return res.status(StatusCodes.OK).send({ id: req.body.id });
});

app.post("/cancel", (req, res) => {
  console.log(chalk.magenta("Cancelling order..."));
  return res.status(StatusCodes.OK).send({ id: req.body.id });
});

app.post("/approve", (req, res) => {
  console.log(chalk.magenta("Approving order..."));
  return res.status(StatusCodes.OK).send({ id: req.body.id });
});

app.listen(80);
console.log(chalk.bold.magenta("Order Service ready"));
