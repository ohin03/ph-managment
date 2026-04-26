const mongoose = require("mongoose");

const vendorReceiveSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "BANK", "MOBILE_BANKING"],
      required: true,
    },

    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    referenceNo: {
      type: String, // Bank trx id / cheque no
    },

    note: {
      type: String,
      maxlength: 500,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorReceive", vendorReceiveSchema);