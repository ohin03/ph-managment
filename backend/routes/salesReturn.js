const express = require("express");
const router = express.Router();
const SalesReturn = require("../models/SalesReturn");
const Sale = require("../models/Sale");
const Item = require("../models/Item");
const Ledger = require("../models/Ledger");
const auth = require("../middleware/auth");

// ================= CREATE SALES RETURN =================
router.post("/", auth, async (req, res) => {
  try {
    const { originalSaleId, items, totalAmount, customerId } = req.body;

    const originalSale = await Sale.findById(originalSaleId);
    if (!originalSale)
      return res.status(404).json({ message: "Original Sale not found" });

    // ===== UPDATE SALE ITEMS & STOCK =====
    for (const returnItem of items) {
      const saleItem = originalSale.items.find(
        (i) => i.medicine === returnItem.medicine
      );

      if (saleItem) {
        saleItem.quantity -= returnItem.quantity;

        // Remove item if quantity <= 0
        if (saleItem.quantity <= 0) {
          originalSale.items = originalSale.items.filter(
            (i) => i.medicine !== returnItem.medicine
          );
        }
      }

      // ===== STOCK INCREASE =====
      await Item.findOneAndUpdate(
        { name: returnItem.medicine },
        { $inc: { stock: Number(returnItem.quantity) } }
      );
    }

    // ===== UPDATE SALE TOTAL =====
    originalSale.totalAmount -= totalAmount;
    await originalSale.save();

    // ===== CREATE SALES RETURN ENTRY =====
    const salesReturn = new SalesReturn({
      originalSaleId,
      customerId,
      items,
      totalAmount,
      returnInvoiceNo: `SR-${Date.now()}`,
      returnDate: new Date(),
    });

    const savedReturn = await salesReturn.save();

    // ===== Ledger Adjustment =====
    if (customerId) {
      await Ledger.create({
        customer: customerId,
        type: "DEBIT",
        amount: totalAmount,
        description: `Sales Return ${savedReturn.returnInvoiceNo}`,
        saleId: originalSaleId,
      });
    }

    res.status(201).json(savedReturn);
  } catch (err) {
    console.error("Sales Return Error:", err);
    res.status(500).json({ message: "Sales Return Failed", error: err.message });
  }
});

// ================= GET ALL RETURNS =================
router.get("/", auth, async (req, res) => {
  try {
    const returns = await SalesReturn.find()
      .populate("customerId", "name")
      .populate("originalSaleId", "invoiceNo")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (err) {
    console.error("Fetch Returns Error:", err);
    res.status(500).json({ message: "Failed to fetch returns" });
  }
});

// ================= DELETE RETURN =================
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await SalesReturn.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Return not found" });

    res.json({ message: "Return deleted successfully" });
  } catch (err) {
    console.error("Delete Return Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// ================= UPDATE RETURN =================
router.put("/:id", auth, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    const salesReturn = await SalesReturn.findById(req.params.id);
    if (!salesReturn) return res.status(404).json({ message: "Return not found" });

    // ===== Reverse previous sale changes =====
    const originalSale = await Sale.findById(salesReturn.originalSaleId);
    if (!originalSale) return res.status(404).json({ message: "Original Sale not found" });

    for (const prevItem of salesReturn.items) {
      // Add previous return qty back to sale
      const saleItem = originalSale.items.find(i => i.medicine === prevItem.medicine);
      if (saleItem) saleItem.quantity += prevItem.quantity;
      else originalSale.items.push({ medicine: prevItem.medicine, quantity: prevItem.quantity, price: prevItem.price });

      // Decrease stock
      await Item.findOneAndUpdate(
        { name: prevItem.medicine },
        { $inc: { stock: -prevItem.quantity } }
      );
    }

    originalSale.totalAmount += salesReturn.totalAmount;
    await originalSale.save();

    // ===== Apply new return =====
    for (const item of items) {
      const saleItem = originalSale.items.find(i => i.medicine === item.medicine);
      if (saleItem) saleItem.quantity -= item.quantity;
      if (saleItem.quantity <= 0) {
        originalSale.items = originalSale.items.filter(i => i.medicine !== item.medicine);
      }

      await Item.findOneAndUpdate(
        { name: item.medicine },
        { $inc: { stock: item.quantity } }
      );
    }
    originalSale.totalAmount -= totalAmount;
    await originalSale.save();

    salesReturn.items = items;
    salesReturn.totalAmount = totalAmount;
    await salesReturn.save();

    res.json(salesReturn);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update Failed", error: err.message });
  }
});




module.exports = router;