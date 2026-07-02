const express = require("express");

const app = express();

app.use(express.json());

const transactionRoutes = require("./routes/transaction.routes");
const analyticsRoutes = require("./routes/analytics.routes");

app.use(analyticsRoutes);
app.use(transactionRoutes);



app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server Running"
    });
});

module.exports = app;