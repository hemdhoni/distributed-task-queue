const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    walletBalance: {
      type: Number,
      default: 10000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);