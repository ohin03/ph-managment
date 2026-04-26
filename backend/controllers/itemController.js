const Item = require("../models/Item");


// =======================
// GET ITEMS (Pagination)
// =======================
exports.getItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const items = await Item.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments();

    res.json({ items, total });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// =======================
// SEARCH ITEMS
// =======================

exports.searchItems = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const items = await Item.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { item_name: { $regex: q, $options: "i" } },   // OLD SUPPORT
        { genericName: { $regex: q, $options: "i" } },
        { generic_name: { $regex: q, $options: "i" } }, // OLD SUPPORT
        { companyName: { $regex: q, $options: "i" } },
        { company_name: { $regex: q, $options: "i" } }  // OLD SUPPORT
      ]
    })
      .limit(100);

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
};
// =======================
// ADD ITEM
// =======================
exports.addItem = async (req, res) => {
  try {
    const {
      name,
      genericName,
      companyName,
      stock,
      purchasePrice,
      batchNo,
      expiryDate,
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Item Name দিতে হবে" });
    }

    const item = new Item({
      name: name.trim(),
      genericName: genericName || "",
      companyName: companyName || "",
      stock: stock || 0,
      purchasePrice: purchasePrice || 0,
      batchNo: batchNo || "",
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await item.save();

    res.status(201).json(item);

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


// =======================
// UPDATE ITEM
// =======================
exports.updateItem = async (req, res) => {
  try {
    const {
      name,
      genericName,
      companyName,
      stock,
      purchasePrice,
      batchNo,
      expiryDate,
    } = req.body;

    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        genericName,
        companyName,
        stock,
        purchasePrice,
        batchNo,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Item not found" });

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


// =======================
// DELETE ITEM
// =======================
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};