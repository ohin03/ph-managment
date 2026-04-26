const router = require("express").Router();
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

const {
  createEmployee,
  getEmployees,
  assignUser,
  toggleEmployeeStatus,
} = require("../controllers/employee.controller");

// ADMIN only
router.post(
  "/employees",
  auth,
  roleGuard(["ADMIN"]),
  createEmployee
);

router.get(
  "/employees",
  auth,
  roleGuard(["ADMIN"]),
  getEmployees
);

router.post(
  "/employees/assign-user",
  auth,
  roleGuard(["ADMIN"]),
  assignUser
);

router.patch(
  "/employees/:id/toggle",
  auth,
  roleGuard(["ADMIN"]),
  toggleEmployeeStatus
);

module.exports = router;
