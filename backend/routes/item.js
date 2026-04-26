const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const auth = require("../middleware/auth");

// Only ADMIN/SUPER_ADMIN
const checkAdmin = (req, res, next) => {
  if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") return next();
  return res.status(403).json({ message: "Access denied" });
};

// GET all items
router.get("/", auth, checkAdmin, async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE new item
router.post("/", auth, checkAdmin, async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE item
router.put("/:id", auth, checkAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE item
router.delete("/:id", auth, checkAdmin, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
