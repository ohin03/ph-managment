const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");
const auth = require("../middleware/auth");

// Create Vendor
router.post("/", auth, async (req, res) => {
  try {
    const openingBalance = Number(req.body.openingBalance || 0);

    const vendor = new Vendor({
      ...req.body,
      currentBalance: openingBalance || 0,
    });
    await vendor.save();
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Vendors with search & pagination
router.get("/", auth, async (req, res) => {
  try {
    const q = req.query.q || "";
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const filter = { name: { $regex: q, $options: "i" } };

    const total = await Vendor.countDocuments(filter);
    const vendors = await Vendor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: vendors,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Vendor
router.put("/:id", auth, async (req, res) => {
  try {
    const existing = await Vendor.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const update = {
      name: req.body.name,
      phone: req.body.phone,
      company: req.body.company,
      currentBalance: req.body.currentBalance,
      status: req.body.status
    };
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Vendor
router.delete("/:id", auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;