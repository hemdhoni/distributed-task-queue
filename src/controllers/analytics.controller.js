const redis = require("../config/redis");
const Transaction = require("../models/Transaction");

exports.getSummary = async (req, res) => {
  try {
    const CACHE_KEY = "analytics-summary";
    const LOCK_KEY = "analytics-lock";

    // 1. Check cache
    const cachedData = await redis.get(CACHE_KEY);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // 2. Acquire lock (cache stampede protection)
    const lock = await redis.set(LOCK_KEY, "locked", "NX", "EX", 5);

    if (lock) {
      // Simulate slow DB
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Total processed volume
      const totalVolume = await Transaction.aggregate([
        {
          $match: { status: "SUCCESS" },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      // Top 5 users
      const topUsers = await Transaction.aggregate([
        {
          $match: { status: "SUCCESS" },
        },
        {
          $group: {
            _id: "$userId",
            volume: { $sum: "$amount" },
          },
        },
        {
          $sort: { volume: -1 },
        },
        {
          $limit: 5,
        },
      ]);

      const response = {
        totalProcessedVolume: totalVolume[0]?.total || 0,
        topUsers,
      };

      // Cache for 60 seconds
      await redis.set(CACHE_KEY, JSON.stringify(response), "EX", 60);

      // Release lock
      await redis.del(LOCK_KEY);

      return res.json(response);
    }

    // 3. Another request is generating cache
    // Wait until cache is available
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const cached = await redis.get(CACHE_KEY);

      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};