const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// ----------------- GET ALL ITEMS (pagination) -----------------
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Item.countDocuments();
    const items = await Item.find()
      .skip(skip)
      .limit(limit)
      .sort({ item_name: 1 });

    res.json({ total, page, limit, items });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch items", error: err.message });
  }
});

// ----------------- ADD ITEM -----------------
router.post("/", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to add item", error: err.message });
  }
});

// ----------------- UPDATE ITEM -----------------
router.put("/:id", async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// ----------------- DELETE ITEM -----------------
router.delete("/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
