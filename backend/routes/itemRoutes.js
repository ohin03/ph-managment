const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const itemController = require("../controllers/itemController");

router.get("/", auth, itemController.getItems);
router.get("/search", auth, itemController.searchItems);

router.post("/", auth, adminOnly, itemController.addItem);
router.put("/:id", auth, adminOnly, itemController.updateItem);
router.delete("/:id", auth, adminOnly, itemController.deleteItem);

module.exports = router;