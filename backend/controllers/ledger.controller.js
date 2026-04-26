const Ledger = require("../models/customerLedger.model");
const Customer = require("../models/customer.model");

// add due (sale)
exports.addSale = async (req, res) => {
  const { customerId, amount, note } = req.body;

  await Ledger.create({
    customer: customerId,
    type: "SALE",
    amount,
    note,
  });

  await Customer.findByIdAndUpdate(customerId, {
    $inc: { openingBalance: amount },
  });

  res.json({ message: "Sale due added" });
};

// receive payment
exports.receivePayment = async (req, res) => {
  const { customerId, amount, note } = req.body;

  await Ledger.create({
    customer: customerId,
    type: "PAYMENT",
    amount,
    note,
  });

  await Customer.findByIdAndUpdate(customerId, {
    $inc: { openingBalance: -amount },
  });

  res.json({ message: "Payment received" });
};

// ledger list
exports.getLedger = async (req, res) => {
  const data = await Ledger.find({ customer: req.params.id })
    .sort({ createdAt: -1 });

  res.json(data);
};