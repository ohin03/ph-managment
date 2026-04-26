const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    position: {
      type: String,
      required: true,
    },

    salary: {
      type: Number,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ✅ PART-6: Attendance tracking
    attendance: {
      loginCount: { type: Number, default: 0 },
      logoutCount: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 },
      lastLoginAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
