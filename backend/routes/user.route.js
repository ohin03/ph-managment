const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth.middleware");
const roleGuard = require("../middleware/roleGuard");
const User = require("../models/User");
const Employee = require("../models/Employee");

/* =========================
   CHANGE EMAIL / PASSWORD
========================= */
router.put("/change-credentials", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword, newEmail } = req.body;

    if (!oldPassword) {
      return res.status(400).json({ message: "Old password required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    // Update password
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password too short" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update email
    if (newEmail) {
      const exists = await User.findOne({ email: newEmail });
      if (exists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = newEmail.toLowerCase();
    }

    await user.save();

    res.json({ message: "Credentials updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* =========================
   EMPLOYEE MANAGEMENT (ADMIN)
   - List / Create / Update / Block
   - Also controls sidebar/menu access
========================= */

// Helper: shape employee + user for frontend
const mapEmployeeUser = (employee) => {
  const user = employee.user || {};

  return {
    _id: employee._id,
    name: employee.name,
    phone: employee.phone,
    position: employee.position,
    salary: employee.salary,
    userId: user._id || null,
    email: user.email || null,
    username: user.username || null,
    role: user.role || null,
    blocked: !!user.isBlocked,
    menuAccess: user.menuAccess || []
  };
};

// GET /api/user/employees
router.get("/employees", auth, roleGuard(["ADMIN"]), async (req, res) => {
  try {
    const employees = await Employee.find().populate("user");
    res.json(employees.map(mapEmployeeUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

// POST /api/user/employees
router.post("/employees", auth, roleGuard(["ADMIN"]), async (req, res) => {
  try {
    const {
      name,
      phone,
      position,
      salary,
      email,
      username,
      password,
      role = "EMPLOYEE",
      menuAccess = []
    } = req.body;

    if (!name || !phone || !position || !salary || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user first
    const user = await User.create({
      email: email.toLowerCase(),
      username: (username || email).toLowerCase(), // keep username unique
      password: hashedPassword,
      role,
      isBlocked: false,
      menuAccess
    });

    // Create employee profile
    const employee = await Employee.create({
      name,
      phone,
      position,
      salary,
      user: user._id
    });

    // Back-reference employee on user
    user.employeeId = employee._id.toString();
    await user.save();

    res.status(201).json(mapEmployeeUser(await employee.populate("user")));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create employee" });
  }
});

// PUT /api/user/employees/:id  (update employee + user + menu access)
router.put("/employees/:id", auth, roleGuard(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      position,
      salary,
      email,
      username,
      password,
      role,
      menuAccess,
      blocked
    } = req.body;

    const employee = await Employee.findById(id).populate("user");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update employee fields
    if (name !== undefined) employee.name = name;
    if (phone !== undefined) employee.phone = phone;
    if (position !== undefined) employee.position = position;
    if (salary !== undefined) employee.salary = salary;

    // Update linked user (if exists)
    if (employee.user) {
      const user = employee.user;

      if (email !== undefined && email !== user.email) {
        const exists = await User.findOne({ email });
        if (exists && String(exists._id) !== String(user._id)) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = email.toLowerCase();
      }

      if (username !== undefined && username !== user.username) {
        const existsUsername = await User.findOne({ username });
        if (existsUsername && String(existsUsername._id) !== String(user._id)) {
          return res.status(400).json({ message: "Username already in use" });
        }
        user.username = username.toLowerCase();
      }

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ message: "Password too short" });
        }
        user.password = await bcrypt.hash(password, 10);
      }

      if (role) {
        user.role = role;
      }

      if (Array.isArray(menuAccess)) {
        user.menuAccess = menuAccess;
      }

      if (typeof blocked === "boolean") {
        user.isBlocked = blocked;
      }

      await user.save();
    }

    await employee.save();

    const fresh = await Employee.findById(id).populate("user");
    res.json(mapEmployeeUser(fresh));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update employee" });
  }
});

// PUT /api/user/employees/:id/block  (block/unblock linked user)
router.put("/employees/:id/block", auth, roleGuard(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body; // boolean

    const employee = await Employee.findById(id).populate("user");
    if (!employee || !employee.user) {
      return res.status(404).json({ message: "Employee or user not found" });
    }

    employee.user.isBlocked = !!block;
    await employee.user.save();

    const fresh = await Employee.findById(id).populate("user");
    res.json(mapEmployeeUser(fresh));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update block status" });
  }
});

module.exports = router;