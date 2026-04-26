const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const { logout } = require("../controllers/attendance.controller");

// Employee logout
router.post("/logout", auth, roleGuard(["EMPLOYEE", "ADMIN"]), logout);

// Employee own attendance
router.get("/me", auth, async (req, res) => {
  const Employee = require("../models/Employee");
  const emp = await Employee.findById(req.user.employeeId);
  res.json(emp.attendance);
});

// Admin view all attendance
router.get(
  "/all",
  auth,
  roleGuard(["ADMIN", "SUPER_ADMIN"]),
  async (req, res) => {
    const Employee = require("../models/Employee");
    const data = await Employee.find().select("name attendance");
    res.json(data);
  }
);

module.exports = router;
