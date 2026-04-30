const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
  medicine: { type: String, required: true },
  batch: String,
  unit: { type: String, trim: true, default: "pcs" },
  conversionRate: { type: Number, default: 1 },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: 0 },
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