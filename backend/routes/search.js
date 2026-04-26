const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// fast search
router.get("/", async (req, res) => {
  const q = req.query.q;

  if (!q || q.trim() === "") return res.json([]);

  try {
    const result = await Item.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { genericName: { $regex: q, $options: "i" } },
        { companyName: { $regex: q, $options: "i" } },
        { item_name: { $regex: q, $options: "i" } },      // Old field names
        { generic_name: { $regex: q, $options: "i" } },
        { company_name: { $regex: q, $options: "i" } }
      ]
    }).limit(10);

    res.json(result);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});

module.exports = router;