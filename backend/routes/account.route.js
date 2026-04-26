const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/account.controller");

// CRUD
router.get("/", auth, controller.getAccounts);
router.get("/:id", auth, controller.getAccount);
router.post("/", auth, controller.createOrUpdateAccount);
router.delete("/:id", auth, controller.deleteAccount);

// TRANSACTIONS
router.post("/transaction", auth, controller.addTransaction);
router.get("/transaction/:accountId", auth, controller.getTransactions);

module.exports = router;
