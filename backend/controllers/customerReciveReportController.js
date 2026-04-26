const CustomerReceive = require("../models/customerReceive.model");

exports.getCustomerReceiveReport = async (req, res) => {
  try {

    const { from, to } = req.query;

    let match = {};

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    // SUMMARY
    const summary = await CustomerReceive.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalReceive: { $sum: "$amount" },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // MONTHLY RECEIVE
    const monthlyReceive = await CustomerReceive.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    // PAYMENT METHOD
    const paymentMethod = await CustomerReceive.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" }
        }
      }
    ]);

    // TOP CUSTOMERS
    const topCustomers = await CustomerReceive.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      {
        $group: {
          _id: "$customer.name",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    // RECENT RECEIVES
    const recentReceives = await CustomerReceive.find(match)
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: summary[0] || { totalReceive: 0, totalTransactions: 0 },
      monthlyReceive,
      paymentMethod,
      topCustomers,
      recentReceives
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Report generation failed" });
  }
};