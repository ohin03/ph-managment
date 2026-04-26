const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    type: { type: String, enum: ["DEPOSIT", "WITHDRAW"], required: true },
    amount: { type: Number, required: true },
    reference: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccountTransaction", transactionSchema);
