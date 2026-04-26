const Purchase = require("../models/Purchase");
const Item = require("../models/Item");

// Create a return
exports.createReturn = async (req, res) => {
  try {
    const { purchaseId, items } = req.body; // items: [{ itemId, returnQty }]

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    // process each return item
    for (let retItem of items) {
      const purchaseItem = purchase.items.find(i => i._id.toString() === retItem.itemId);
      if (!purchaseItem) continue;

      const alreadyReturned = purchaseItem.returnQty || 0;
      if (retItem.returnQty + alreadyReturned > purchaseItem.quantity)
        return res.status(400).json({ message: "Return qty exceeds purchased qty" });

      purchaseItem.returnQty = alreadyReturned + retItem.returnQty;
      purchaseItem.remainingQty = purchaseItem.quantity - purchaseItem.returnQty;

      // update stock in Item collection
      const itemStock = await Item.findById(purchaseItem.itemId);
      if (itemStock) {
        itemStock.stock -= retItem.returnQty;
        await itemStock.save();
      }
    }

    await purchase.save();
    res.json({ message: "Return processed", purchase });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// Optional: get all purchase returns (for list)
exports.getAllReturns = async (req, res) => {
  try {
    const purchases = await Purchase.find();
    const returns = [];
    purchases.forEach(p => {
      p.items.forEach(i => {
        if ((i.returnQty || 0) > 0) {
          returns.push({
            invoiceNo: p.invoiceNo,
            purchaseDate: p.purchaseDate,
            supplier: p.supplier,
            medicineName: i.medicineName,
            batchNo: i.batchNo,
            purchaseQty: i.quantity,
            returnQty: i.returnQty,
            remainingQty: i.remainingQty
          });
        }
      });
    });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
