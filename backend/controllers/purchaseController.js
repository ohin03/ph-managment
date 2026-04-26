const Purchase = require("../models/Purchase");
const Item = require("../models/Item");

exports.createPurchase = async (req, res) => {
  try {
    const { supplier, invoiceNo, items } = req.body;

    if (!supplier || !invoiceNo || !items || !items.length) {
      return res.status(400).json({ message: "Invalid purchase data" });
    }

    // check duplicate invoice
    const existing = await Purchase.findOne({ invoiceNo });
    if (existing) return res.status(400).json({ message: "Invoice No already exists" });

    let totalAmount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Save stock update to Item
      let med = await Item.findOne({ name: item.medicineName });


      if (!med) {
        // Create new medicine if not exists
        med = await Item.create({
          name: item.medicineName,
          batchNo: item.batchNo,
          stock: item.quantity,
          purchasePrice: item.purchasePrice,
          expiryDate: item.expiryDate
        });
      } else {
        // update stock & purchase info
        med.stock += item.quantity;
        med.purchasePrice = item.purchasePrice;
        med.batchNo = item.batchNo;
        med.expiryDate = item.expiryDate;
        await med.save();
      }

      // replace medicineName with ObjectId
      items[i].medicine = med._id;
      totalAmount += item.quantity * item.purchasePrice;
    }

    const purchase = await Purchase.create({
      supplier,
      invoiceNo,
      items,
      totalAmount
    });

    const populatedPurchase = await purchase.populate("items.medicine", "name");

    res.status(201).json(populatedPurchase);
  } catch (err) {
    console.error("CREATE PURCHASE ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("items.medicine", "name")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    console.error("FETCH PURCHASES ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};