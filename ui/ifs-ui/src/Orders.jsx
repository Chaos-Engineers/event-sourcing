import React from "react";
import useFetch from "react-fetch-hook";

const Orders = ({}) => {
  const orders = useFetch("http://orders.api.svc.cluster.local/orders");
  // const customers = useFetch("https://customers.api.svc.cluster.local/customers");

  if (orders.isLoading) return <div>Loading...</div>;

  return (
    <>
      <h1>Orders</h1>
      <div className="orders">
        {orders.forEach(order => {
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
              {order.items.map(item => {
                <div className="orderItem">
                  <div>{item.name}</div>
                  <div>{item.price}</div>
                  <div>{item.quantity}</div>
                </div>
              })}
            </div>
          </div>;
        })}
      </div>
    </>
  );
};

Orders.propTypes = {};

export default Orders;
