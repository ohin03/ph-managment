const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const User = require("../models/User");
const { comparePassword } = require("../utils/password.util");

/* =======================================
   TEMPORARY REGISTER ROUTE
   (REMOVE IN PRODUCTION)
======================================= */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      username: email, // ensure unique username to satisfy existing index
      password: hashedPassword,

      // 🔐 Auth required fields
      role: "ADMIN",        // default (change later)
      employeeId: null,
      isBlocked: false,

      // 🔒 Security fields
      failedLogin: 0,
      blockedUntil: null
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
  message: "Registration failed",
  error: err.message
});

  }
});

/* =======================================
   LOGIN ROUTE (FINAL – PART 2)
======================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* 🔴 PERMANENT BLOCK (ADMIN) */
    if (user.isBlocked) {
      return res.status(403).json({
        message: "User is blocked by admin"
      });
    }

    /* ⏳ TEMPORARY BLOCK */
    if (user.blockedUntil && user.blockedUntil > Date.now()) {
      return res.status(403).json({
        message: "User blocked temporarily"
      });
    }

    const isMatch = await comparePassword(password, user.password);

    /* ❌ WRONG PASSWORD */
    if (!isMatch) {
      user.failedLogin += 1;

      if (user.failedLogin >= 5) {
        user.blockedUntil = Date.now() + 15 * 60 * 1000; // 15 min
      }

      await user.save();

      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    /* ✅ SUCCESS LOGIN */
    user.failedLogin = 0;
    user.blockedUntil = null;
    
    // Ensure username is set (for existing users without username)
    if (!user.username) {
      user.username = user.email;
    }
    
    await user.save();

    /* 🕒 ATTENDANCE LOGIN UPDATE (PART-6) */
    const employee = await Employee.findOne({ user: user._id });

    if (employee) {
      employee.attendance.loginCount += 1;
      employee.attendance.lastLoginAt = new Date();
      await employee.save();
    }

    /* 🔐 JWT (RICH PAYLOAD) */
    const tokenPayload = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
      menuAccess: user.menuAccess || []
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 👤 Also send minimal user object for frontend
    const safeUser = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
      menuAccess: user.menuAccess || []
    };

    res.json({ token, user: safeUser });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
