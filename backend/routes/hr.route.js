const express = require("express");
const router = express.Router();
const hr = require("../controllers/hr.controller");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

// Employee list and history
router.get("/employees", auth, roleGuard(["ADMIN"]), hr.getEmployees); // 401 fix
router.get("/salary-history", auth, roleGuard(["ADMIN"]), hr.getSalaryHistoryByMonth); // 404 fix
router.post("/pay-salary", auth, roleGuard(["ADMIN"]), hr.paySalary);
router.put("/salary-update/:id", auth, roleGuard(["ADMIN"]), hr.updateSalary);
router.delete("/salary-delete/:id", auth, roleGuard(["ADMIN"]), hr.deleteSalary);
router.get("/last-due/:empId", auth, roleGuard(["ADMIN"]), hr.getEmployeeLastDue);
router.post("/attendance-save", auth, roleGuard(["ADMIN"]), hr.saveAttendance);
router.get("/attendance-check", auth, roleGuard(["ADMIN"]), hr.checkAttendance);


router.get("/hr-stats", auth, roleGuard(["ADMIN"]), hr.getHRStats);


router.get("/attendance-report", auth, roleGuard(["ADMIN" , "EMPLOYEE"]), hr.getAttendanceReport);

module.exports = router;