const mongoose = require("mongoose");

const SaleItemSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  batch: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // salesPrice
  total: Number,
});

const SaleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  saleDate: { type: Date, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [SaleItemSchema],
  discount: { type: Number, default: 0 },       
  totalAmount: Number,
  totalPaid: Number,
  totalDue: Number
}, { timestamps: true });

module.exports = mongoose.model("Sale", SaleSchema);