const mongoose = require("mongoose");   

const LedgerSchema = new mongoose.Schema(
  {
    // Customer related ledger (sale/payment)
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    // Vendor related ledger (purchase/payment to vendor)
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },

    type: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    reference: String,
    description: String,

    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },

    vendorSaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorSale",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ledger", LedgerSchema);