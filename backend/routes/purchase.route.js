const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const Item = require("../models/Item");

const structuredError = (res, status, message, field) =>
  res.status(status).json({ success: false, message, field });

const resolveMedicineName = (line) =>
  (line.medicine || line.name || line.medicineName || line.item_name || "").toString().trim();

const validatePurchasePayload = (body) => {
  if (!body.supplier || !String(body.supplier).trim()) {
    return { message: "Supplier is required", field: "supplier" };
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { message: "At least one item is required", field: "items" };
  }

  for (let i = 0; i < body.items.length; i += 1) {
    const line = body.items[i];
    const medicineName = resolveMedicineName(line);
    if (!line.medicineId && !medicineName) {
      return { message: `Item ${i + 1}: Please select a medicine from the dropdown or enter a valid medicine name`, field: `items[${i}].medicine` };
    }
    if (!(Number(line.quantity) > 0)) {
      return { message: `Item ${i + 1}: quantity must be greater than 0`, field: `items[${i}].quantity` };
    }
    if (!(Number(line.price) > 0)) {
      return { message: `Item ${i + 1}: price must be greater than 0`, field: `items[${i}].price` };
    }
    if (line.salePrice !== undefined && Number(line.salePrice) < 0) {
      return { message: `Item ${i + 1}: salePrice cannot be negative`, field: `items[${i}].salePrice` };
    }
    if (!line.expiryDate) {
      return { message: `Item ${i + 1}: expiryDate is required`, field: `items[${i}].expiryDate` };
    }
  }

  return null;
};

const sanitizeItems = async (items, session) =>
  await Promise.all(
    items.map(async (line, idx) => {
      let medicineName = resolveMedicineName(line);
      if (!medicineName && line.medicineId) {
        const item = await Item.findById(line.medicineId).session(session);
        medicineName = item?.name || item?.item_name || "";
      }

      if (!medicineName) {
        const err = new Error(`Item ${idx + 1}: Medicine name could not be resolved. Please ensure you select from the dropdown or enter a valid name.`);
        err.status = 400;
        err.field = "items[].medicine";
        throw err;
      }

      const quantity = Number(line.quantity);
      const price = Number(line.price);
      const salePrice = line.salePrice !== undefined ? Number(line.salePrice) : undefined;
      return {
        medicineId: line.medicineId || null,
        medicine: medicineName,
        batch: (line.batch || "").toString().trim(),
        quantity,
        price,
        salePrice,
        expiryDate: line.expiryDate ? new Date(line.expiryDate) : null,
        total: quantity * price, // backend controlled
      };
    })
  );

const applyStock = async (items, sign, session) => {
  for (const line of items) {
    const medicineName = resolveMedicineName(line);

    let item = null;

    // Priority 1: Look up by medicineId if present
    if (line.medicineId) {
      item = await Item.findById(line.medicineId).session(session);
      if (!item) {
        throw new Error(`Medicine with ID ${line.medicineId} not found in database`);
      }
    }

    // Priority 2: Look up by name if medicineId failed
    if (!item && medicineName) {
      const quantity = Number(line.quantity);
      const escapedName = medicineName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      item = await Item.findOne({
        $or: [
          { name: new RegExp(`^${escapedName}$`, "i") },
          { item_name: new RegExp(`^${escapedName}$`, "i") }
        ]
      }).session(session);
    }

    // If still not found and this is a purchase addition (not reversal)
    if (!item) {
      if (sign < 0) continue; // nothing to reverse for deleted unknown items
      if (!medicineName) {
        throw new Error("Cannot save purchase: medicine name is missing or invalid. Please select an existing medicine or ensure the name is correctly entered.");
      }
      // Create only as last resort
      item = new Item({
        name: medicineName,
        stock: 0,
        purchasePrice: 0,
        batchNo: "",
        expiryDate: null,
      });
    }

    // Update stock and pricing
    const quantity = Number(line.quantity);
    item.stock = Number(item.stock || 0) + sign * quantity;
    item.purchasePrice = Number(line.price);
    item.salesPrice = line.salePrice !== undefined ? Number(line.salePrice) : item.salesPrice || Number(line.price);
    item.batchNo = (line.batch || "").toString().trim();
    item.expiryDate = line.expiryDate ? new Date(line.expiryDate) : null;
    if (item.stock < 0) item.stock = 0;

    await item.save({ session });
  }
};

// Create purchase
router.post("/", async (req, res) => {
  const payloadError = validatePurchasePayload(req.body);
  if (payloadError) return structuredError(res, 400, payloadError.message, payloadError.field);

  const session = await mongoose.startSession();
  try {
    let createdPurchase = null;
    await session.withTransaction(async () => {
      const cleanItems = await sanitizeItems(req.body.items, session);
      const grandTotal = cleanItems.reduce((sum, line) => sum + line.total, 0);
      const purchase = new Purchase({
        invoiceNo: req.body.invoiceNo,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date(),
        supplier: String(req.body.supplier).trim(),
        items: cleanItems,
        grandTotal,
      });

      await purchase.save({ session });
      await applyStock(cleanItems, 1, session);
      createdPurchase = purchase;
    });

    return res.status(201).json(createdPurchase);
  } catch (err) {
    return structuredError(res, 500, err.message || "Failed to create purchase", "purchase");
  } finally {
    session.endSession();
  }
});

// Get all purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    structuredError(res, 500, err.message || "Failed to fetch purchases", "purchase");
  }
});

// Update purchase
router.put("/:id", async (req, res) => {
  const payloadError = validatePurchasePayload(req.body);
  if (payloadError) return structuredError(res, 400, payloadError.message, payloadError.field);

  const session = await mongoose.startSession();
  try {
    let updatedPurchase = null;
    await session.withTransaction(async () => {
      const purchase = await Purchase.findById(req.params.id).session(session);
      if (!purchase) {
        const e = new Error("Purchase not found");
        e.status = 404;
        throw e;
      }

      // Rule: invoiceNo must never be changed
      if (req.body.invoiceNo && req.body.invoiceNo !== purchase.invoiceNo) {
        const e = new Error("invoiceNo cannot be changed");
        e.status = 400;
        e.field = "invoiceNo";
        throw e;
      }

      // reverse old stock first
      await applyStock(purchase.items, -1, session);

      const cleanItems = await sanitizeItems(req.body.items, session);
      const grandTotal = cleanItems.reduce((sum, line) => sum + line.total, 0);

      purchase.purchaseDate = req.body.purchaseDate ? new Date(req.body.purchaseDate) : purchase.purchaseDate;
      purchase.supplier = String(req.body.supplier).trim();
      purchase.items = cleanItems;
      purchase.grandTotal = grandTotal;

      await purchase.save({ session });
      await applyStock(cleanItems, 1, session);
      updatedPurchase = purchase;
    });

    return res.json(updatedPurchase);
  } catch (err) {
    return structuredError(
      res,
      err.status || 500,
      err.message || "Failed to update purchase",
      err.field || "purchase"
    );
  } finally {
    session.endSession();
  }
});

// Delete purchase
router.delete("/:id", async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const purchase = await Purchase.findById(req.params.id).session(session);
      if (!purchase) {
        const err = new Error("Purchase not found");
        err.status = 404;
        throw err;
      }
      await applyStock(purchase.items, -1, session);
      await purchase.deleteOne({ session });
    });
    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    return structuredError(res, err.status || 500, err.message || "Failed to delete purchase", "purchase");
  } finally {
    session.endSession();
  }
});

module.exports = router;
