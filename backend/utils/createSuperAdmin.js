const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Employee = require("../models/Employee");

const createSuperAdmin = async () => {
  try {
    let admin = await User.findOne({ role: "ADMIN" });

    // If user already exists, just ensure employee profile exists
    if (!admin) {
      const hashedPassword = await bcrypt.hash(
        process.env.SUPER_ADMIN_PASSWORD,
        10
      );

      admin = new User({
        email: process.env.SUPER_ADMIN_EMAIL,
        username: process.env.SUPER_ADMIN_EMAIL, // keep username unique using email
        password: hashedPassword,
        role: "ADMIN",
        isBlocked: false,
        failedLogin: 0,
        blockedUntil: null
      });

      await admin.save();
      console.log("🔥 Super Admin user created successfully");
    } else {
      console.log("👑 Super Admin user already exists");
    }

    // Ensure there is an Employee record linked to super admin
    let employee = await Employee.findOne({ user: admin._id });

    if (!employee) {
      employee = await Employee.create({
        name: "Super Admin",
        phone: "0000000000",
        position: "Owner",
        salary: 0,
        user: admin._id
      });

      admin.employeeId = employee._id.toString();
      await admin.save();

      console.log("📋 Super Admin employee profile created");
    } else if (!admin.employeeId) {
      // Backfill employeeId on user if missing
      admin.employeeId = employee._id.toString();
      await admin.save();
    }

  } catch (error) {
    console.error("❌ Super Admin creation failed:", error.message);
  }
};

module.exports = createSuperAdmin;
