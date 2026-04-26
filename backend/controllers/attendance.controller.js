const Employee = require("../models/Employee");

exports.logout = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const lastLogin = employee.attendance.lastLoginAt;

    if (lastLogin) {
      const diffMs = Date.now() - new Date(lastLogin).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      employee.attendance.totalHours += diffHours;
    }

    employee.attendance.logoutCount += 1;
    employee.attendance.lastLoginAt = null;

    await employee.save();

    res.json({ message: "Logout success & attendance updated" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};
