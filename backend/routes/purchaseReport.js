const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");

router.get("/purchase-report", async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {};

    if (from && to) {
      match.purchaseDate = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    // ===== SUMMARY =====
    const summary = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalPurchase: { $sum: "$grandTotal" },
          totalInvoices: { $sum: 1 },
        },
      },
    ]);

    // ===== MONTHLY =====
    const monthly = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: "$purchaseDate" } },
          total: { $sum: "$grandTotal" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // ===== SUPPLIER WISE =====
    const supplierWise = await Purchase.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$supplier",
          total: { $sum: "$grandTotal" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // ===== TOP MEDICINES =====
    const topMedicines = await Purchase.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.medicine",
          totalQty: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      summary: summary[0] || {
        totalPurchase: 0,
        totalInvoices: 0,
      },
      monthly,
      supplierWise,
      topMedicines,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;