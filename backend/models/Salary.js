const mongoose = require("mongoose");
const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  month: { type: String, required: true },
  basicSalary: { type: Number, required: true },
  advance: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  netPaid: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Cash", "Bank"], default: "Cash" },
  status: { type: String, default: "Paid" }
}, { timestamps: true });
module.exports = mongoose.model("Salary", salarySchema);