const mongoose = require("mongoose");

const purchaseReturnSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true },
    invoiceNo: { type: String, required: true },
    supplier: { type: String, required: true },
    purchaseQty: { type: Number, required: true },
    returnQty: { type: Number, required: true },
    returnDate: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseReturn", purchaseReturnSchema);
