const Account = require("../models/Account.model");
const Transaction = require("../models/AccountTransaction.model");

// CREATE / UPDATE ACCOUNT
exports.createOrUpdateAccount = async (req, res) => {
  try {
    const { id, ...data } = req.body;

    if (id) {
      const updated = await Account.findByIdAndUpdate(id, data, { new: true });
      return res.json(updated);
    }

    const account = new Account({
      ...data,
      currentBalance: data.openingBalance || 0
    });
    await account.save();
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL ACCOUNTS
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().sort({ createdAt: -1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE ACCOUNT
exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE ACCOUNT
exports.deleteAccount = async (req, res) => {
  try {
    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TRANSACTION: DEPOSIT / WITHDRAW
exports.addTransaction = async (req, res) => {
  try {
    const { accountId, type, amount, reference } = req.body;

    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });

    let newBalance = account.currentBalance;
    if (type === "DEPOSIT") newBalance += amount;
    else if (type === "WITHDRAW") newBalance -= amount;

    account.currentBalance = newBalance;
    await account.save();

    const txn = new Transaction({ account: accountId, type, amount, reference });
    await txn.save();

    res.json({ account, transaction: txn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET TRANSACTIONS BY ACCOUNT
exports.getTransactions = async (req, res) => {
  try {
    const { accountId } = req.params;
    const txns = await Transaction.find({ account: accountId }).sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
