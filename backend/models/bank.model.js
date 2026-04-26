const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true },
    branch: { type: String },
    accountNumber: { type: String, required: true, unique: true },
    accountType: {
      type: String,
      enum: ["SAVINGS", "CURRENT"],
      default: "CURRENT",
    },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bank", bankSchema);
