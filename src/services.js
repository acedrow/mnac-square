import axios from "axios";

//TODO: PAGINATION CURSOR SUPPORT 
export const fetchCustomers = async (baseUrl, authtoken) => {
  const response = await axios.get(`${baseUrl}/v2/customers`, {
    headers: {
      Authorization: `Bearer ${authtoken}`,
    },
  });
  let customers = [];
  response.data.customers.forEach((customer) => {
    if (customer.given_name && customer.family_name) {
      customers.push({
        name: customer.given_name + " " + customer.family_name,
        id: customer.id,
      });
    }
  });
  return customers;
};

export const fetchOrders = async (
  baseUrl,
  authtoken,
  customerIds,
  locationId,
  startDate,
  endDate,
) => {
  const response = await axios.post(
    `${baseUrl}/v2/orders/search`,
    {
      return_entries: false,
      location_ids: [locationId],
      query: {
        filter: {
          customer_filter: {
            customer_ids: customerIds,
          },
          date_time_filter: {
            created_at: {
              start_at: startDate,
              end_at: endDate,
            },
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${authtoken}`,
      },
    },
  );
  return response.data.orders;
};
