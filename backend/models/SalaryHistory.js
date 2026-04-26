const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  month: { type: String, required: true },
  basicSalary: { type: Number, required: true },
  paidAmount: { type: Number, required: true }, 
  dueAmount: { type: Number, default: 0 },      
  advance: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  netPaid: { type: Number, required: true },    
  paymentMethod: { type: String, default: "Cash" }
}, { timestamps: true });

module.exports = mongoose.model("SalaryHistory", salarySchema);