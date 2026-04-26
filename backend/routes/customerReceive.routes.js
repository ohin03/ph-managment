const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  createCustomerReceive,
  getCustomerReceives,
  updateCustomerReceive,
  deleteCustomerReceive,
} = require("../controllers/customerReceive.controller");

router.post("/", auth, createCustomerReceive);
router.get("/", auth, getCustomerReceives);
router.put("/:id", auth, updateCustomerReceive);
router.delete("/:id", auth, deleteCustomerReceive);

module.exports = router;