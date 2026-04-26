const VendorReceive = require("../models/VendorReceive");
const Vendor = require("../models/Vendor");
const mongoose = require("mongoose");

/* ================= CREATE ================= */
exports.createVendorReceive = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { vendorId, amount, paymentMethod, referenceNo, note } = req.body;

    if (!vendorId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const vendor = await Vendor.findById(vendorId).session(session);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const receiptNo = "VR-" + Date.now();

    const newReceive = await VendorReceive.create(
      [
        {
          receiptNo,
          vendorId,
          amount,
          paymentMethod,
          referenceNo,
          note,
          createdBy: req.user?.id,
        },
      ],
      { session }
    );

    // 🔥 Balance Adjust (Payment reduces payable)
    vendor.currentBalance -= amount;
    await vendor.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newReceive[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ================= */
exports.getVendorReceives = async (req, res) => {
  try {
    const data = await VendorReceive.find({ isDeleted: false })
      .populate("vendorId", "name phone company")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ================= */
exports.updateVendorReceive = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { amount, paymentMethod, referenceNo, note } = req.body;

    const receive = await VendorReceive.findById(id).session(session);
    if (!receive) {
      return res.status(404).json({ message: "Record not found" });
    }

    const vendor = await Vendor.findById(receive.vendorId).session(session);

    // 🔥 Reverse old amount
    vendor.currentBalance += receive.amount;

    // 🔥 Apply new amount
    vendor.currentBalance -= amount;

    receive.amount = amount;
    receive.paymentMethod = paymentMethod;
    receive.referenceNo = referenceNo;
    receive.note = note;

    await receive.save({ session });
    await vendor.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(receive);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

/* ================= SOFT DELETE ================= */
exports.deleteVendorReceive = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const receive = await VendorReceive.findById(id).session(session);
    if (!receive) {
      return res.status(404).json({ message: "Record not found" });
    }

    const vendor = await Vendor.findById(receive.vendorId).session(session);

    // 🔥 Reverse balance
    vendor.currentBalance += receive.amount;

    receive.isDeleted = true;

    await vendor.save({ session });
    await receive.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};