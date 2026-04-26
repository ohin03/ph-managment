const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Leave'], default: 'Present' },
    note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);