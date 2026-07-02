require("dotenv").config();

const mongoose = require("mongoose");

const app = require("./src/app");
const connectDB = require("./src/config/db");
const redis = require("./src/config/redis");

// Start BullMQ Worker
require("./src/queues/worker");

const PORT = process.env.PORT || 3000;

let server;

(async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Start Express Server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
})();

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    // Stop accepting new requests
    server.close(async () => {
      console.log("HTTP server closed.");

      // Close MongoDB connection
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");

      // Close Redis connection
      await redis.quit();
      console.log("Redis connection closed.");

      process.exit(0);
    });
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));