const express = require("express");
const router = express.Router();

const {
  getCustomerReceiveReport
} = require("../controllers/customerReciveReportController");

router.get("/customer-receive-report", getCustomerReceiveReport);

module.exports = router;