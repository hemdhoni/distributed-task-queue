const express = require("express");

const router = express.Router();

const rateLimiter = require("../middleware/rateLimiter");
const transactionController = require("../controllers/transaction.controller");

router.post(
  "/v1/transactions",
  rateLimiter,
  transactionController.createTransaction
);

module.exports = router;