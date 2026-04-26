const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    // Optional username kept only to satisfy existing unique index in DB.
    // We always populate it with a unique value (e.g. email) when creating users
    // so we don't get duplicate-key errors on { username: null }.
    username: {
      type: String,
      unique: true
    },

    // 👑 System roles
    // ADMIN    => Super Admin (full access)
    // EMPLOYEE => Staff user (limited, configurable per menu)
    // USER     => Normal user (if needed later)
    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE", "USER"],
      default: "USER"
    },

    employeeId: {
      type: String,
      default: null
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    failedLogin: {
      type: Number,
      default: 0
    },

    blockedUntil: {
      type: Date,
      default: null
    },

    // 🔑 Dynamic sidebar/menu access per user (for EMPLOYEE)
    // e.g. ["dashboard", "medicines"]
    menuAccess: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
