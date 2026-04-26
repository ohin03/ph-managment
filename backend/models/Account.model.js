const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Cash / Bank / bKash etc.
    type: { type: String, enum: ["CASH", "BANK", "MOBILE"], required: true },
    bankName: String, // for bank accounts
    branch: String,
    accountNumber: String,
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
