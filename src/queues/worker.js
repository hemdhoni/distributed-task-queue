const { Worker } = require("bullmq");
const mongoose = require("mongoose");

const redis = require("../config/redis");

const User = require("../models/User");
const Transaction = require("../models/Transaction");

const worker = new Worker(
  "transaction-queue",
  async (job) => {
    const session = await mongoose.startSession();

    try {
      const { id, userId, amount, currency, timestamp } = job.data;

      // simulate external network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      session.startTransaction();

      // ---------- Idempotency ----------
      const existingTransaction = await Transaction.findOne({
        transactionId: id,
      }).session(session);

      if (existingTransaction) {
        console.log("Duplicate Transaction:", id);

        await session.abortTransaction();
        session.endSession();
        return;
      }

      // ---------- Find User ----------
      const user = await User.findOne({ userId }).session(session);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.walletBalance < amount) {
        throw new Error("Insufficient Balance");
      }

      // ---------- Deduct Wallet ----------
      user.walletBalance -= amount;

      await user.save({ session });

      // ---------- Save Transaction ----------
      await Transaction.create(
        [
          {
            transactionId: id,
            userId,
            amount,
            currency,
            timestamp,
            status: "SUCCESS",
          },
        ],
        { session }
      );

      await session.commitTransaction();

      console.log("Transaction Processed:", id);
    } catch (err) {
      console.log(err.message);

      await session.abortTransaction();

      throw err; // BullMQ retries automatically
    } finally {
      session.endSession();
    }
  },
  {
    connection: redis,
  }
);

module.exports = worker;