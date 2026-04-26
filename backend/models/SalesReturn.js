const mongoose = require("mongoose");

const SalesReturnItemSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: Number,
});

const SalesReturnSchema = new mongoose.Schema(
  {
    returnInvoiceNo: { type: String, required: true },
    originalSaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    returnDate: { type: Date, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [SalesReturnItemSchema],
    totalAmount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesReturn", SalesReturnSchema);