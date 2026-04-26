const mongoose = require("mongoose");

const vendorSaleSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentMethod: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorSale", vendorSaleSchema);