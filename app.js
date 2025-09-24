const express = require('express')
require('dotenv').config();
const axios = require('axios');

const app = express()
const port = 3000

console.log(`Database Host: ${process.env.SQUARE_PROD_ACCESS_TOKEN}`);

app.get('/customers', async (req, res) => {
    try {
        const response = await axios.get(`https://connect.squareup.com/v2/customers`, {
            headers: {
                'Authorization': `Bearer ${process.env.SQUARE_PROD_ACCESS_TOKEN}`
            }
        })
        let customers = [];
        response.data.customers.forEach(customer => {
            if (customer.given_name && customer.family_name) {
                customers.push({ name: customer.given_name + ' ' + customer.family_name, id: customer.id });
            }
        });

        res.send(customers)
    } catch (error) {
        res.status(error.response.status).send(error.response.data)
    }
})

app.post('/mnac-subscriptions/:customerId', async (req, res) => {
    try {
        const response = await axios.post(`https://connect.squareup.com/v2/orders/search`, {
            return_entries: true,
            location_ids: [
                process.env.SQUARE_MNAC_LOCATION_ID
            ],
            query: {
                filter: {
                    customer_filter: {
                        customer_ids: [req.params.customerId]
                    }
                }
            }

        }, {
            headers: {
                'Authorization': `Bearer ${process.env.SQUARE_PROD_ACCESS_TOKEN}`
            }
        })
        const subscriptions = response.data.order_entries.filter(
            order => order.line_items.some(
                lineItem => lineItem.name === 'MNAC Membership')).map(
                    order => order.created_at)
        res.send(subscriptions)
    } catch (error) {
        console.log(error)
        res.status(error.response.status).send(error.response.data)
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
