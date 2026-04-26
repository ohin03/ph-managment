const express = require("express");
const router = express.Router();
const SalesReturn = require("../models/SalesReturn");

// SALES RETURN REPORT
router.get("/sales-return-report", async (req, res) => {
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
    const summary = await SalesReturn.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalReturnAmount: { $sum: "$totalAmount" },
          totalTransactions: { $sum: 1 },
          totalItemsReturned: { $sum: { $size: "$items" } },
        },
      },
    ]);

    // ===== MONTHLY RETURNS =====
    const monthlyReturns = await SalesReturn.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // ===== TOP RETURNED MEDICINES =====
    const topReturnedMedicines = await SalesReturn.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.medicine",
          totalQuantity: { $sum: "$items.quantity" },
          totalAmount: { $sum: "$items.total" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      summary: summary[0] || {},
      monthlyReturns,
      topReturnedMedicines,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Return Report Failed" });
  }
});

module.exports = router;