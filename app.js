import express from "express";
import dotenv from "dotenv";
import { fetchCustomers, fetchOrders } from "./src/services.js";
import dayjs from "dayjs";

dotenv.config();
const app = express();
const port = 3000;

// gets all square customers with names
app.get("/customers", async (_, res) => {
  try {
    const customers = await fetchCustomers(
      process.env.SQUARE_PROD_API_BASE_URL,
      process.env.SQUARE_PROD_ACCESS_TOKEN,
    );
    res.send(customers);
  } catch (error) {
    console.log(error);
    res.status(error?.response?.status ?? 500).send(error?.response?.data);
  }
});

app.get("/membership-report", async (req, res) => {
  try {
    const customers = await fetchCustomers(
      process.env.SQUARE_PROD_API_BASE_URL,
      process.env.SQUARE_PROD_ACCESS_TOKEN,
    );
    const customerIds = customers.map((customer) => customer.id);
    let orderData = [];
    let index = 0;

    while (index < customerIds.length + 9) {
      const subscriptions = await fetchOrders(
        process.env.SQUARE_PROD_API_BASE_URL,
        process.env.SQUARE_PROD_ACCESS_TOKEN,
        customerIds.slice(index, index + 10),
        process.env.SQUARE_MNAC_LOCATION_ID,
        `${dayjs().startOf("month").format("YYYY-MM-DDTHH:mm")}:00Z`,
        `${dayjs().endOf("month").format("YYYY-MM-DDTHH:mm")}:00Z`,
      );
      orderData = [...orderData, ...subscriptions];
      index += 10;
    }

    orderData = orderData.filter((order) =>
      order.line_items.some((lineItem) => lineItem.name === "MNAC Membership"),
    );


    const reportData = customers.map((customer) => {
      const membershipOrder = orderData.find(
        (order) => order.customer_id === customer.id,
      );
      return {
        customerName: customer.name,
        customerId: customer.id,
        activeMembership: membershipOrder ? "Yes" : "No",
        orderId: membershipOrder?.id ?? "No membership order found",
        orderDate: membershipOrder?.created_at ?? "No membership order found",
      };
    });

    res.send(reportData);
  } catch (error) {
    console.log(error);
    res.status(error.response.status).send(error.response.data);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
