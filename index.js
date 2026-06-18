const express = require("express");
const cors = require("cors");
const { SquareClient, SquareEnvironment } = require("square");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
const crypto = require("crypto");

const client = new SquareClient({
    environment: SquareEnvironment.Sandbox,
    token: process.env.SQUARE_CLIENT_TOKEN,
});

app.get('/', (req, res) => {
    res.json({ message: '✅ Square Payments server is up and running!' });
});

app.post('/pay', async (req, res) => {

    try {

        const { sourceId, amount } = req.body;

        if (!sourceId || !amount) {
            return res.status(400).json({ error: "Missing sourceId or amount" });
        }

        const response = await client.payments.create({
            amountMoney: {
                amount: BigInt(amount),
                currency: "USD",
            },
            sourceId: sourceId,
            idempotencyKey: crypto.randomUUID()
        });

        res.json({
            status: response.payment.status,
            id: response.payment.id,
            amount: response.payment.amountMoney.amount.toString(),
            currency: response.payment.amountMoney.currency.toString(),
            created_at: response.payment.createdAt.toString(),
        });

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ error: "Payment failed" });
    }

});

module.exports = app;
