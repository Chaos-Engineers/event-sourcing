import React, { useState, useEffect } from "react";
import useFetch from "react-fetch-hook";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Orders = () => {
  const [panel, setPanel] = useState("main");

  return (
    <>
      <h1>Orders</h1>
      <div className="content-panel">
        {panel === "main" && <MainPanel setPanel={setPanel} />}
        {panel === "new" && <NewOrderPanel setPanel={setPanel} />}
      </div>
    </>
  );
};

const NewOrderPanel = ({ setPanel }) => {
  const [order, setOrder] = useState({});
  const [customer, setCustomer] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [po, setPo] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("");
  const [username, setUsername] = useState("");
  const [items, setItems] = useState([false, false, false, false, false, false]);

  const itemList = ["Pens", "Paper", "Eraser", "Pencils", "Sharpener", "Paper Clips"];

  const closeNewOrders = () => {
    setPanel("main");
  };

  const submit = async () => {
    const itms = [];
    let itemCount = 0;

    for (let i = 0; i < items.length; i++) {
      if (items[i]) itemCount++;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i]) continue;
      itms.push({
        name: itemList[i],
        price: price / itemCount,
        quantity: 1
      });
    }

    const newOrder = {
      customerId: customerId,
      po: po,
      address: address,
      deliverDate: date,
      price: price,
      currency: currency,
      username: username,
      items: itms
    };

    await fetch("http://localhost:30000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newOrder)
    });

    setPanel("main");
  };

  return (
    <div className="new-panel">
      <div className="well well-sm">
        <div className="rendered-form">
          <div className="">
            <h3 id="control-6565779">Order Stationary</h3>
          </div>
          <div className="formbuilder-text form-group field-customerid">
            <label htmlFor="customerid" className="formbuilder-text-label">
              Customer ID
              <span className="tooltip-element" tooltip="Select your Customer ID">
                ?
              </span>
            </label>
            <input type="text" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="customer" className="form-control" name="customerid" id="customerid" title="Select your Customer ID" />
          </div>
          <div className="formbuilder-text form-group field-po">
            <label htmlFor="po" className="formbuilder-text-label">
              Purchase Order ID
              <span className="tooltip-element" tooltip="Enter your PO">
                ?
              </span>
            </label>
            <input type="text" value={po} onChange={e => setPo(e.target.value)} placeholder="PO" className="form-control" name="po" id="po" title="Enter your PO" />
          </div>
          <div className="formbuilder-textarea form-group field-address">
            <label htmlFor="address" className="formbuilder-textarea-label">
              Delivery Address
              <span className="tooltip-element" tooltip="Please provide your delivery address">
                ?
              </span>
            </label>
            <textarea type="textarea" value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" className="form-control" name="address" id="address" title="Please provide your delivery address"></textarea>
          </div>
          <div className="formbuilder-number form-group field-price">
            <label htmlFor="price" className="formbuilder-number-label">
              Total Price
              <span className="tooltip-element" tooltip="Enter the total price">
                ?
              </span>
            </label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="$" className="form-control" name="price" min="0" id="price" title="Enter the total price" />
          </div>
          <div className="formbuilder-text form-group field-currency">
            <label htmlFor="currency" className="formbuilder-text-label">
              Currency
              <span className="tooltip-element" tooltip="Enter the currency of the price shown above">
                ?
              </span>
            </label>
            <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} placeholder="$" className="form-control" name="currency"  maxLength="4" id="currency" title="Enter the currency of the price shown above" />
          </div>
          <div className="formbuilder-date form-group field-date">
            <label htmlFor="date" className="formbuilder-date-label">
              Delivery Date
              <span className="tooltip-element" tooltip="When do you need this order to be delivered?">
                ?
              </span>
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-control" name="date" id="date" title="When do you need this order to be delivered?" />
          </div>
          <div className="formbuilder-text form-group field-username">
            <label htmlFor="username" className="formbuilder-text-label">
              Email Address
              <span className="tooltip-element" tooltip="Enter your email address">
                ?
              </span>
            </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="form-control" name="username" id="username" title="Enter your email address" />
          </div>
          <div className="formbuilder-checkbox-group form-group field-items">
            <label htmlFor="items" className="formbuilder-checkbox-group-label">
              Order Items
            </label>
            <div className="checkbox-group">
              <div className="formbuilder-checkbox">
                <label htmlFor="items-0" className="kc-toggle">
                  <input name="items[]" checked={items[0]} onChange={() => setItems(i => [...i.splice(0, 1, !i[0])])} id="items-0"  type="checkbox" />
                  <span></span>Pens
                </label>
              </div>
              <div className="formbuilder-checkbox">
                <label htmlFor="items-1" className="kc-toggle">
                  <input name="items[]" checked={items[1]} onChange={() => setItems(i => [...i.splice(1, 1, !i[1])])} id="items-1"  type="checkbox" />
                  <span></span>Paper
                </label>
              </div>
              <div className="formbuilder-checkbox">
                <label htmlFor="items-2" className="kc-toggle">
                  <input name="items[]" checked={items[2]} onChange={() => setItems(i => [...i.splice(2, 1, !i[2])])} id="items-2"  type="checkbox" />
                  <span></span>Eraser
                </label>
              </div>
              <div className="formbuilder-checkbox">
                <label htmlFor="items-3" className="kc-toggle">
                  <input name="items[]" checked={items[3]} onChange={() => setItems(i => [...i.splice(3, 1, !i[3])])} id="items-3"  type="checkbox" />
                  <span></span>Pencils
                </label>
              </div>
              <div className="formbuilder-checkbox">
                <label htmlFor="items-4" className="kc-toggle">
                  <input name="items[]" checked={items[4]} onChange={() => setItems(i => [...i.splice(4, 1, !i[4])])} id="items-4"  type="checkbox" />
                  <span></span>Sharpener
                </label>
              </div>
              <div className="formbuilder-checkbox">
                <label htmlFor="items-5" className="kc-toggle">
                  <input name="items[]" checked={items[5]} onChange={() => setItems(i => [...i.splice(5, 1, !i[5])])} id="items-5"  type="checkbox" />
                  <span></span>Paper Clips
                </label>
              </div>
            </div>
          </div>
          <div className="formbuilder-button form-group field-submit">
            <button type="button" className="btn-primary btn submit" name="submit" id="submit" onClick={() => submit()}>
              Place Order
            </button>
            <button type="button" className="btn-danger btn" name="close" id="close" onClick={() => closeNewOrders()}>
              Close
            </button>
          </div>
        </div>{" "}
      </div>
    </div>
  );
};

const MainPanel = ({ setPanel }) => {
  const orders = useFetch("http://localhost:30000/orders");

  const handleNewOrder = () => {
    setPanel("new");
  };

  if (orders.isLoading) return <div>Loading...</div>;

  if (Object.keys(orders.data).length === 0) {
    orders.data["orders"] = [];
  }

  return (
    <div className="main-panel">
      <button onClick={() => handleNewOrder()}>New Order</button>

      <div>Orders</div>

      <div className="orders">
        {orders.data.orders.length === 0 ? (
          <div>No orders</div>
        ) : (
          orders.data.orders.map(order => (
            <div className="order">
              <div className="orderId">
                <div>Id</div>
                <div>{order.id}</div>
              </div>
              <div className="orderItemCount">
                <div>Item Count</div>
                <div>{order.items.length}</div>
              </div>
              <div className="orderDate">
                <div>Date</div>
                <div>{order.time}</div>
              </div>
              <div className="orderItems">
                <div>Items</div>
                {order.items.map(item => (
                  <div className="orderItem">
                    <div>{item.name}</div>
                    <div>{item.price}</div>
                    <div>{item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

Orders.propTypes = {};

export default Orders;
