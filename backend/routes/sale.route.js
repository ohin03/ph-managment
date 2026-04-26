const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Ledger = require("../models/Ledger");
const Item = require("../models/Item");
const auth = require("../middleware/auth");


// =============================
// ===== ADD SALE =====
// =============================
router.post("/", auth, async (req, res) => {
  try {
    const sale = new Sale({
      ...req.body,
      discount: Number(req.body.discount || 0),
      totalAmount: Number(req.body.totalAmount || 0),
      totalPaid: Number(req.body.totalPaid || 0),
      totalDue: Number(req.body.totalDue || 0),
    });

    const savedSale = await sale.save();

    // 🔻 Reduce stock
    for (const soldItem of req.body.items) {
      await Item.findOneAndUpdate(
        { name: soldItem.medicine },
        { $inc: { stock: -Number(soldItem.quantity) } }
      );
    }

    // ✅ Ledger Entry (IMPORTANT FIX HERE)
    if (req.body.customerId && savedSale.totalDue > 0) {
      await Ledger.create({
        customer: req.body.customerId,
        type: "DEBIT", // ✅ FIXED (আগে CREDIT ছিল)
        amount: savedSale.totalDue,
        reference: savedSale.invoiceNo,
        description: `Sale Invoice ${savedSale.invoiceNo}`,
        saleId: savedSale._id,
      });
    }

    res.status(201).json(savedSale);
  } catch (err) {
    res.status(500).json({ message: "Sale creation failed", error: err.message });
  }
});


// =============================
// ===== UPDATE SALE =====
// =============================
router.put("/:id", auth, async (req, res) => {
  try {
    const saleId = req.params.id;

    const existingSale = await Sale.findById(saleId);
    if (!existingSale)
      return res.status(404).json({ message: "Sale not found" });

    // 🔄 Update fields
    existingSale.invoiceNo = req.body.invoiceNo || existingSale.invoiceNo;
    existingSale.saleDate = req.body.saleDate || existingSale.saleDate;
    existingSale.customerId = req.body.customerId || null;
    existingSale.items = req.body.items;
    existingSale.discount = Number(req.body.discount || 0);
    existingSale.totalAmount = Number(req.body.totalAmount || 0);
    existingSale.totalPaid = Number(req.body.totalPaid || 0);
    existingSale.totalDue = Number(req.body.totalDue || 0);

    const updatedSale = await existingSale.save();

    const newCustomerId = updatedSale.customerId;
    const newDue = updatedSale.totalDue;

    if (!newCustomerId || newDue <= 0) {
      // ❌ No due → delete ledger row
      await Ledger.deleteMany({ saleId });
    } else {
      // ✅ Update or Create ledger row (DEBIT)
      await Ledger.findOneAndUpdate(
        { saleId },
        {
          customer: newCustomerId,
          type: "DEBIT", // ✅ FIXED
          amount: newDue,
          reference: updatedSale.invoiceNo,
          description: `Sale Invoice ${updatedSale.invoiceNo} (updated)`,
          saleId,
        },
        { upsert: true, new: true }
      );
    }

    res.json(updatedSale);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});


// =============================
// ===== GET ALL SALES =====
// =============================
router.get("/", auth, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales" });
  }
});


// =============================
// ===== DELETE SALE =====
// =============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // 🔺 Restore stock
    for (const soldItem of sale.items) {
      await Item.findOneAndUpdate(
        { name: soldItem.medicine },
        { $inc: { stock: Number(soldItem.quantity) } }
      );
    }

    // ❗ Also delete ledger entry
    await Ledger.deleteMany({ saleId: sale._id });

    await Sale.findByIdAndDelete(req.params.id);

    res.json({ message: "Sale deleted, stock restored & ledger cleared" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;