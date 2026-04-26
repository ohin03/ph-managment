const express = require("express");
const router = express.Router();
const VendorSale = require("../models/VendorSale");

router.get("/vendor-report", async (req, res) => {
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
    const summary = await VendorSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
          totalDue: { $sum: "$dueAmount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    // ===== MONTHLY =====
    const monthly = await VendorSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // ===== TOP VENDORS =====
    const topVendors = await VendorSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$vendorId",
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      {
        $project: {
          name: "$vendor.name",
          totalAmount: 1,
        },
      },
    ]);

    // ===== PAYMENT METHOD =====
    const paymentMethod = await VendorSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      summary: summary[0] || {
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        totalTransactions: 0,
      },
      monthly,
      topVendors,
      paymentMethod,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;