const CustomerReceive = require("../models/customerReceive.model");
const Ledger = require("../models/Ledger");
const Customer = require("../models/customer.model");

// ================= CREATE CUSTOMER RECEIVE =================
exports.createCustomerReceive = async (req, res) => {
  try {
    const { customerId, amount, paymentMethod, note } = req.body;

    if (!customerId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const receiptNo = "CR-" + Date.now();

    // Duplicate receipt prevention
    const existing = await CustomerReceive.findOne({ receiptNo });
    if (existing) {
      return res.status(400).json({ message: "Duplicate receipt" });
    }

    const receive = await CustomerReceive.create({
      receiptNo,
      customerId,
      amount,
      paymentMethod,
      note,
    });

    await Ledger.create({
      customer: customerId,
      type: "CREDIT",
      amount,
      reference: receiptNo,
      description: "Customer Payment Received",
    });

    res.status(201).json(receive);
  } catch (err) {
    console.error("Customer Receive Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL CUSTOMER RECEIVES =================
exports.getCustomerReceives = async (req, res) => {
  try {
    const receives = await CustomerReceive.find()
      .sort({ createdAt: -1 })
      .populate("customerId", "name phone");
    res.json(receives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch receives" });
  }
};

// ================= UPDATE CUSTOMER RECEIVE =================
exports.updateCustomerReceive = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, amount, paymentMethod, note } = req.body;

    if (!customerId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const receive = await CustomerReceive.findById(id);
    if (!receive) return res.status(404).json({ message: "Record not found" });

    receive.customerId = customerId;
    receive.amount = amount;
    receive.paymentMethod = paymentMethod;
    receive.note = note;

    await receive.save();

    // Ledger update
    const ledgerEntry = await Ledger.findOne({ reference: receive.receiptNo });
    if (ledgerEntry) {
      ledgerEntry.amount = amount;
      ledgerEntry.type = "CREDIT";
      ledgerEntry.description = "Customer Payment Updated";
      await ledgerEntry.save();
    }

    res.json(receive);
  } catch (err) {
    console.error("Update receive error:", err);
    res.status(500).json({ message: "Failed to update receive" });
  }
};

// ================= DELETE CUSTOMER RECEIVE =================
exports.deleteCustomerReceive = async (req, res) => {
  try {
    const { id } = req.params;
    const receive = await CustomerReceive.findByIdAndDelete(id);

    if (!receive) return res.status(404).json({ message: "Record not found" });

    // Delete ledger entry
    await Ledger.findOneAndDelete({ reference: receive.receiptNo });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete receive error:", err);
    res.status(500).json({ message: "Failed to delete receive" });
  }
};