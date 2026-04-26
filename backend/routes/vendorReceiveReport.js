const express = require("express");
const router = express.Router();
const VendorReceive = require("../models/VendorReceive");

router.get("/vendor-receive-report", async (req, res) => {
  try {
    const { startDate, endDate, vendorId, paymentMethod } = req.query;

    let filter = { isDeleted: false };

    if (startDate && endDate) {
      filter.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (vendorId) {
      filter.vendorId = vendorId;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    const data = await VendorReceive.find(filter)
      .populate("vendorId", "name phone")
      .sort({ transactionDate: -1 });

    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    res.json({
      success: true,
      totalAmount,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;