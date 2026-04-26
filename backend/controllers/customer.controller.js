const Customer = require("../models/customer.model");
const Ledger = require("../models/Ledger");

// CREATE
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    // If openingBalance is set, create an initial DEBIT entry in ledger
    const openingBalance = Number(customer.openingBalance || 0);
    if (openingBalance > 0) {
      await Ledger.create({
        customer: customer._id,
        type: "DEBIT",
        amount: openingBalance,
        reference: "Opening Balance",
        description: "Initial opening balance",
      });
    }

    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ
exports.getCustomers = async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
};

// UPDATE
exports.updateCustomer = async (req, res) => {
  try {
    const existing = await Customer.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const prevBalance = Number(existing.openingBalance || 0);
    const nextBalance =
      req.body.openingBalance !== undefined
        ? Number(req.body.openingBalance)
        : prevBalance;

    // Apply main update
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // If balance changed, write a ledger entry to keep history in sync
    if (nextBalance !== prevBalance) {
      const diff = Math.abs(nextBalance - prevBalance);
      if (diff > 0) {
        const type = nextBalance > prevBalance ? "DEBIT" : "CREDIT";
        const description =
          type === "CREDIT"
            ? "Customer payment (balance decreased)"
            : "Balance increased";

        await Ledger.create({
          customer: existing._id,
          type,
          amount: diff,
          reference: "Balance Update",
          description: `${description}: ${prevBalance} → ${nextBalance}`,
        });
      }
    }

    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



// DELETE
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Optional: delete related ledger
    await Ledger.deleteMany({ customer: req.params.id });

    res.json({ message: "Customer deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};