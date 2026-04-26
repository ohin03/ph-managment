const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true, default: "" },
    companyName: { type: String, trim: true, default: "" },
    stock: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    batchNo: { type: String, trim: true, default: "" },
    expiryDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);