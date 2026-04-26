const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customer.controller");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.post("/", auth, adminOnly, createCustomer);
router.get("/", auth, getCustomers);
router.put("/:id", auth, adminOnly, updateCustomer);
router.delete("/:id", auth, adminOnly, deleteCustomer);
module.exports = router;