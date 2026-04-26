const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const auth = require("../middleware/auth");


// =======================================================
// 📊 SALES REPORT (Charts + Summary + Top Medicines)
// URL → /api/reports/sales-report
// =======================================================
router.get("/sales-report", auth, async (req, res) => {
  try {
    const { from, to } = req.query;

    let match = {};
    if (from && to) {
      match.saleDate = {
        $gte: new Date(from),
        $lte: new Date(to + "T23:59:59"),
      };
    }

    // ==================== SUMMARY ====================
    const totalSummary = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$totalPaid" },
          totalDue: { $sum: "$totalDue" },
        },
      },
    ]);

    // ==================== MONTHLY SALES ====================
    const monthlySales = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: "$saleDate" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // ==================== TOP MEDICINES ====================
    const topMedicines = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.medicine",
          totalQuantity: { $sum: "$items.quantity" },
          totalSales: { $sum: "$items.total" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      summary: totalSummary[0] || {},
      monthlySales,
      paymentMethod: [
        { _id: "Paid", total: totalSummary[0]?.totalPaid || 0 },
        { _id: "Due", total: totalSummary[0]?.totalDue || 0 },
      ],
      topMedicines: topMedicines.map((m) => ({
        medicine: m._id,
        totalQuantity: m.totalQuantity,
        totalSales: m.totalSales,
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Report Failed" });
  }
});


// =======================================================
// 🧾 SALES LIST (Filter + Search + Pagination)
// URL → /api/reports/sales-list
// =======================================================
router.get("/sales-list", auth, async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const { from, to, search } = req.query;

    let filter = {};

    // 📅 Date filter
    if (from && to) {
      filter.saleDate = {
        $gte: new Date(from),
        $lte: new Date(to + "T23:59:59"),
      };
    }

    // 🔍 Invoice search
    if (search) {
      filter.invoiceNo = { $regex: search, $options: "i" };
    }

    const total = await Sale.countDocuments(filter);

    const sales = await Sale.find(filter)
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: sales,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales list" });
  }
});

module.exports = router;