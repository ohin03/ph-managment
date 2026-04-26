const express = require("express");
const router = express.Router();
const PurchaseReturn = require("../models/PurchaseReturn");

// ================= PURCHASE RETURN REPORT =================
router.get("/purchase-return-report", async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {};

    if (from && to) {
      match.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    // ===== SUMMARY =====
    const summary = await PurchaseReturn.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalReturns: { $sum: 1 },
          totalReturnQty: { $sum: "$returnQty" },
        },
      },
    ]);

    // ===== SUPPLIER WISE =====
    const supplierWise = await PurchaseReturn.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$supplier",
          totalQty: { $sum: "$returnQty" },
        },
      },
      { $sort: { totalQty: -1 } },
    ]);

    // ===== MONTHLY =====
    const monthly = await PurchaseReturn.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalQty: { $sum: "$returnQty" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    res.json({
      summary: summary[0] || {
        totalReturns: 0,
        totalReturnQty: 0,
      },
      supplierWise,
      monthly,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;