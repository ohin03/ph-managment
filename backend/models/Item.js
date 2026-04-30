const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    batchNo: { type: String, trim: true, default: "" },
    quantity: { type: Number, default: 0, min: 0 }, // stored in base pcs/units
    expiryDate: { type: Date, default: null },
    purchasePrice: { type: Number, default: 0, min: 0 },
    unit: { type: String, trim: true, default: "pcs" },
    conversionRate: { type: Number, default: 1, min: 1 }, // e.g. 1 box = 10 pcs
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    genericName: { type: String, trim: true, default: "" },
    companyName: { type: String, trim: true, default: "" },
    unit: { type: String, trim: true, default: "pcs" },
    stock: { type: Number, default: 0, min: 0 },
    purchasePrice: { type: Number, default: 0, min: 0 },
    salesPrice: { type: Number, default: 0, min: 0 },
    batchNo: { type: String, trim: true, default: "" },
    expiryDate: { type: Date, default: null },
    reorderLevel: { type: Number, default: 0, min: 0 },
    batches: { type: [batchSchema], default: [] },
    lastPurchaseAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Fast search for purchase/sales entry
itemSchema.index({ name: "text", genericName: "text" });

// Keep stock and legacy fields in sync with batch data
itemSchema.pre("validate", function () {
  if (Array.isArray(this.batches) && this.batches.length > 0) {
    this.batches = this.batches.filter((b) => Number(b.quantity || 0) > 0);

    const totalBatchQty = this.batches.reduce(
      (sum, b) => sum + Number(b.quantity || 0),
      0
    );
    this.stock = totalBatchQty;

    const latestBatch = this.batches[this.batches.length - 1];
    if (latestBatch) {
      this.batchNo = latestBatch.batchNo || "";
      this.expiryDate = latestBatch.expiryDate || null;
      this.purchasePrice = Number(latestBatch.purchasePrice || this.purchasePrice || 0);
      this.unit = latestBatch.unit || this.unit || "pcs";
    }
  }

  if (this.stock < 0) this.stock = 0;
  if (this.purchasePrice < 0) this.purchasePrice = 0;
  if (this.reorderLevel < 0) this.reorderLevel = 0;

});

module.exports = mongoose.model("Item", itemSchema);