const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  batch: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  expiryDate: Date,
  total: Number
});

const PurchaseSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  supplier: { type: String, required: true },
  items: [ItemSchema],
  grandTotal: Number
}, { timestamps: true });

module.exports = mongoose.model("Purchase", PurchaseSchema);