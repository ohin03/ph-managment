const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");
const auth = require("../middleware/auth");

const structuredError = (res, status, message, field) =>
  res.status(status).json({ success: false, message, field });

// Create medicine master record
router.post("/", auth, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const genericName = (req.body.genericName || "").trim();
    const unit = (req.body.unit || "pcs").trim();
    const stock = Number(req.body.stock || 0);
    const purchasePrice = Number(req.body.purchasePrice || 0);

    if (!name) return structuredError(res, 400, "Medicine name is required", "name");
    if (stock < 0) return structuredError(res, 400, "Stock cannot be negative", "stock");
    if (purchasePrice < 0) return structuredError(res, 400, "Purchase price cannot be negative", "purchasePrice");

    const existing = await Medicine.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
    if (existing) {
      return structuredError(res, 400, "Medicine already exists", "name");
    }

    const medicine = await Medicine.create({
      name,
      genericName,
      unit,
      stock,
      purchasePrice,
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: medicine._id,
        name: medicine.name,
        genericName: medicine.genericName,
        unit: medicine.unit,
        stock: medicine.stock,
        purchasePrice: medicine.purchasePrice,
      },
    });
  } catch (err) {
    return structuredError(res, 500, err.message || "Failed to create medicine", "medicine");
  }
});

// Smart medicine search for purchase entry
// GET /api/medicines/search?q=
router.get("/search", auth, async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");
    const medicines = await Medicine.find({
      $or: [
        { name: regex },
        { item_name: regex },
        { genericName: regex },
        { generic_name: regex },
        { companyName: regex },
        { company_name: regex },
      ],
    })
      .select("_id name item_name genericName generic_name unit stock purchasePrice purchase_price salesPrice sales_price")
      .sort({ name: 1 })
      .limit(10);

    return res.json(medicines);
  } catch (err) {
    return structuredError(res, 500, err.message || "Failed to search medicines", "q");
  }
});

// Optional stock audit consistency check
router.get("/audit/stock", auth, async (req, res) => {
  try {
    const medicines = await Medicine.find().select("name stock batches");
    const report = medicines.map((m) => {
      const batchTotal = (m.batches || []).reduce((sum, b) => sum + Number(b.quantity || 0), 0);
      return {
        _id: m._id,
        name: m.name,
        stock: Number(m.stock || 0),
        batchTotal,
        consistent: Number(m.stock || 0) === batchTotal,
      };
    });
    return res.json(report);
  } catch (err) {
    return structuredError(res, 500, err.message || "Failed to audit stock", "stock");
  }
});

module.exports = router;

