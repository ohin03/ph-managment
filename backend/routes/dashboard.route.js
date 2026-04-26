// backend/routes/dashboard.route.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const roleGuard = require("../middleware/role.middleware");

router.get(
  "/dashboard",
  auth,
  roleGuard(["ADMIN", "EMPLOYEE"]),
  (req, res) => {
    // req.user JWT থেকে এসেছে
    console.log("Logged in user info:", req.user);

    res.json({
      message: "Dashboard data",
      user: req.user
    });
  }
);

module.exports = router;
