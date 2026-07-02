const transactionQueue = require("../queues/transaction.queue");

exports.createTransaction = async (req, res) => {
  try {
    const { id, userId, amount, currency, timestamp } = req.body;

    if (!id || !userId || !amount || !currency || !timestamp) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    await transactionQueue.add(
      "process-transaction",
      {
        id,
        userId,
        amount,
        currency,
        timestamp,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
      }
    );

    return res.status(202).json({
      success: true,
      message: "Transaction queued successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};