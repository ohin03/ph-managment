const Employee = require("../models/Employee");
const User = require("../models/User");

/**
 * ADMIN: Create employee
 */
exports.createEmployee = async (req, res) => {
  try {
    const { name, phone, position, salary } = req.body;

    if (!name || !phone || !position || !salary) {
      return res.status(400).json({ message: "All fields required" });
    }

    const employee = await Employee.create({
      name,
      phone,
      position,
      salary,
    });

    res.status(201).json({
      message: "Employee created",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Get all employees
 */
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("user", "email role");

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Assign user to employee
 */
exports.assignUser = async (req, res) => {
  try {
    const { employeeId, userId } = req.body;

    const employee = await Employee.findById(employeeId);
    const user = await User.findById(userId);

    if (!employee || !user) {
      return res.status(404).json({ message: "Employee or User not found" });
    }

    employee.user = user._id;
    await employee.save();

    user.employeeId = employee._id;
    await user.save();

    res.json({ message: "User assigned to employee" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN: Block / Unblock employee
 */
exports.toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    res.json({
      message: `Employee ${employee.isActive ? "Unblocked" : "Blocked"}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
