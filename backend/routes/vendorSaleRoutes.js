const express = require("express");
const router = express.Router();
const VendorSale = require("../models/VendorSale");
const Vendor = require("../models/Vendor");
const Ledger = require("../models/Ledger");

// ================= CREATE =================
router.post("/", async (req, res) => {
  try {
    const { vendorId, amount, paidAmount, paymentMethod, note } = req.body;

    const invoiceNo = "VS-" + Date.now();
    const dueAmount = amount - paidAmount;

    const sale = await VendorSale.create({
      invoiceNo,
      vendorId,
      amount,
      paidAmount,
      dueAmount,
      paymentMethod,
      note,
    });

    // Update vendor currentBalance (how much we owe vendor)
    await Vendor.findByIdAndUpdate(vendorId, {
      $inc: { currentBalance: dueAmount },
    });

    // Ledger: vendor purchase increases due (DEBIT)
    if (dueAmount > 0) {
      await Ledger.create({
        vendor: vendorId,
        type: "DEBIT",
        amount: dueAmount,
        reference: invoiceNo,
        description: note || "Purchase from vendor",
        vendorSaleId: sale._id,
      });
    }

    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: "Create Failed" });
  }
});

// ================= GET ALL (NEWEST FIRST) =================
router.get("/", async (req, res) => {
  try {
    const data = await VendorSale.find()
      .populate("vendorId")
      .sort({ createdAt: -1 }); // 🔥 newest first

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Fetch Failed" });
  }
});

// ================= UPDATE =================
router.put("/:id", async (req, res) => {
  try {
    const { amount, paidAmount, paymentMethod, note } = req.body;

    const sale = await VendorSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Not found" });

    const oldDue = sale.dueAmount;
    const newDue = amount - paidAmount;
    const diff = newDue - oldDue;

    // Adjust vendor currentBalance
    await Vendor.findByIdAndUpdate(sale.vendorId, {
      $inc: { currentBalance: diff },
    });

    // Sync vendor ledger entry for this VendorSale
    if (newDue <= 0) {
      // fully paid → remove ledger entry for this vendor sale
      await Ledger.deleteMany({ vendorSaleId: sale._id });
    } else {
      // upsert DEBIT entry for remaining due
      await Ledger.findOneAndUpdate(
        { vendorSaleId: sale._id },
        {
          vendor: sale.vendorId,
          type: "DEBIT",
          amount: newDue,
          reference: sale.invoiceNo,
          description: note || "Purchase updated",
          vendorSaleId: sale._id,
        },
        { upsert: true, new: true }
      );
    }

    sale.amount = amount;
    sale.paidAmount = paidAmount;
    sale.dueAmount = newDue;
    sale.paymentMethod = paymentMethod;
    sale.note = note;

    await sale.save();

    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: "Update Failed" });
  }
});

// ================= DELETE =================
router.delete("/:id", async (req, res) => {
  try {
    const sale = await VendorSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Not found" });

    await Vendor.findByIdAndUpdate(sale.vendorId, {
      $inc: { currentBalance: -sale.dueAmount },
    });

    // Remove ledger entry for this vendor sale
    await Ledger.deleteMany({ vendorSaleId: sale._id });

    await sale.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed" });
  }
});

module.exports = router;