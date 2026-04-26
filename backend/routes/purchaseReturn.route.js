const express = require("express");
const router = express.Router();
const PurchaseReturn = require("../models/PurchaseReturn");

// GET ALL
router.get("/", async (req, res) => {
  try {
    const data = await PurchaseReturn.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const newReturn = new PurchaseReturn({
      invoiceId: req.body.invoiceId,
      invoiceNo: req.body.invoiceNo,
      supplier: req.body.supplier,
      purchaseQty: Number(req.body.purchaseQty),
      returnQty: Number(req.body.returnQty),
      returnDate: req.body.returnDate,
    });

    await newReturn.save();
    res.json(newReturn);
  } catch (err) {
    res.status(500).json({ message: "Save Failed" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    await PurchaseReturn.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Update Failed" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await PurchaseReturn.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed" });
  }
});

module.exports = router;
