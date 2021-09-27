const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();
app.use(express.json());

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
  if (errors.length === 0) return res.status(200).send(req.body);
  return res.status(400).send(errors);
});

app.post("/create", (req, res) => {
  if (errors.length === 0) return res.send({ ...req.body, orderId: uuid(), status: "new" });
});

app.post("/fulfil", (req, res) => {
  const order = req.body;
  return res.send({ ...req.body, status: "fulfilled", consignments: { count: 3, shipped: 0, received: 0 } });
});

app.post("/ship", (req, res) => {
  const order = req.body;
  if (order.consignments.shipped < order.consignments.count) return { ...order, status: "shipping", consignments: { ...consignments, ship: order.consignments.ship + 1 } };
  return res.send({ ...order, status: `shipped`, shipConsignment: -1 });
});

app.post("/receive", (req, res) => {
  const order = req.body;
  if (order.received_consignments < order.consignments) return { ...order, status: "received_consignment", consignments: { ...consignments, received: order.consignments.received + 1 } };
  return res.send({ ...req.body, status: "received" });
});

app.post("/cancel", (req, res) => {
  const order = req.body;
  if (order.consignments.ship > 0) {
    res.status(400).send({ ...order, status: "aborting cancellation", notes: "Cannot cancel as part of order has been shipped" });
  }
  return res.send({ ...req.body, status: "cancelled" });
});

app.post("/approve", (req, res) => {
  return res.send({ ...req.body, status: "approved" });
});

http.createServer(app).listen(process.env.ORDER_PORT);
