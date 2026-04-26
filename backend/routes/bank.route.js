const express = require("express");
const router = express.Router();
const Bank = require("../models/bank.model");
const auth = require("../middleware/auth");

// Create Bank
router.post("/", auth, async (req, res) => {
  try {
    const bank = new Bank({
      ...req.body,
      currentBalance: req.body.openingBalance || 0,
    });
    await bank.save();
    res.json(bank);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all banks (search)
router.get("/", auth, async (req, res) => {
  const q = req.query.q || "";
  const banks = await Bank.find({
    bankName: { $regex: q, $options: "i" },
  }).sort({ createdAt: -1 });
  res.json(banks);
});

// Update bank
router.put("/:id", auth, async (req, res) => {
  try {
    const bank = await Bank.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(bank);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
