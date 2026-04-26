const express = require("express");
const router = express.Router();
const Ledger = require("../models/Ledger");
const VendorSale = require("../models/VendorSale");
const auth = require("../middleware/auth");

/**
 * Format ledger entries with running balance
 * @param {Array} entries - Ledger entries from DB
 * @returns {Object} { formattedEntries, currentBalance }
 */
const formatLedger = (entries) => {
  let runningBalance = 0;

  const formatted = entries.map((e) => {
    let debit = 0;
    let credit = 0;

    if (e.type === "DEBIT") {
      debit = e.amount;
      runningBalance += e.amount; // Vendor/customer owe
    } else if (e.type === "CREDIT") {
      credit = e.amount;
      runningBalance -= e.amount; // Payment
    }

    return {
      _id: e._id,
      date: e.createdAt,
      reference: e.reference || "-",
      description: e.description || "-",
      debit,
      credit,
      balance: runningBalance, // Running balance
    };
  });

  return {
    formattedEntries: formatted.reverse(), // Latest first
    currentBalance: runningBalance, // Current due/balance
  };
};

/* ===============================
   GET CUSTOMER LEDGER
================================ */
router.get("/customer/:customerId", auth, async (req, res) => {
  try {
    const { customerId } = req.params;
    const entries = await Ledger.find({ customer: customerId }).sort({ createdAt: 1 });
    const { formattedEntries, currentBalance } = formatLedger(entries);

    res.json({
      entries: formattedEntries,
      currentDue: currentBalance, // Customer ledger এ due দেখাবে
    });
  } catch (err) {
    console.error("Customer Ledger Error:", err);
    res.status(500).json({
      message: "Failed to fetch customer ledger",
      error: err.message,
    });
  }
});

/* ===============================
   GET VENDOR LEDGER
   (Computed directly from VendorSale)
================================ */
router.get("/vendor/:vendorId", auth, async (req, res) => {
  try {
    const { vendorId } = req.params;

    // All vendor sales for this vendor, oldest first
    const sales = await VendorSale.find({ vendorId }).sort({ createdAt: 1 });

    let runningBalance = 0;
    const entries = sales.map((s) => {
      const due = Number(s.dueAmount || 0);
      let debit = 0;
      let credit = 0;

      // Treat remaining due as DEBIT (we owe vendor)
      if (due > 0) {
        debit = due;
        runningBalance += due;
      }

      return {
        _id: s._id,
        date: s.createdAt,
        reference: s.invoiceNo,
        description: s.note || "-",
        debit,
        credit,
        balance: runningBalance,
      };
    });

    res.json({
      entries: entries.reverse(),     // latest first in UI
      currentDue: runningBalance,     // total vendor due
    });
  } catch (err) {
    console.error("Vendor Ledger Error:", err);
    res.status(500).json({
      message: "Failed to fetch vendor ledger",
      error: err.message,
    });
  }
});

module.exports = router;