const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  createVendorReceive,
  getVendorReceives,
  updateVendorReceive,
  deleteVendorReceive,
} = require("../controllers/vendorReceive.controller");

router.get("/", auth, getVendorReceives);
router.post("/", auth, createVendorReceive);
router.put("/:id", auth, updateVendorReceive);
router.delete("/:id", auth, deleteVendorReceive);

module.exports = router;