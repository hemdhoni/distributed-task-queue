const { Queue } = require("bullmq");
const redis = require("../config/redis");

const transactionQueue = new Queue("transaction-queue", {
  connection: redis,
});

module.exports = transactionQueue;