require("dotenv").config();

const connectDB = require("./config/db");

const User = require("./models/User");

(async () => {
  await connectDB();

  await User.deleteMany({});

  await User.insertMany([
    {
      userId: "user1",
      walletBalance: 10000,
    },
    {
      userId: "user2",
      walletBalance: 15000,
    },
    {
      userId: "user3",
      walletBalance: 8000,
    },
    {
      userId: "user4",
      walletBalance: 20000,
    },
    {
      userId: "user5",
      walletBalance: 5000,
    },
  ]);

  console.log("Users Seeded");

  process.exit();
})();