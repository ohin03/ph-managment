const Employee = require("../models/Employee");
const SalaryHistory = require("../models/SalaryHistory");
const Attendance = require("../models/Attendance");
exports.getEmployees = async (req, res) => {
    try {
        const emps = await Employee.find();
        res.json(emps);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSalaryHistoryByMonth = async (req, res) => {
    try {
        const { month } = req.query; // Example: "March-2026"
        const history = await SalaryHistory.find({ month }).populate("employeeId", "name position");
        res.json(history);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.paySalary = async (req, res) => {
    try {
        const newSalary = new SalaryHistory(req.body);
        await newSalary.save();
        res.json({ message: "Paid!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Update Salary Record
exports.updateSalary = async (req, res) => {
    try {
        await SalaryHistory.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "Salary record updated!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete Salary Record
exports.deleteSalary = async (req, res) => {
    try {
        await SalaryHistory.findByIdAndDelete(req.params.id);
        res.json({ message: "Record deleted!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getEmployeeLastDue = async (req, res) => {
    try {
        const lastRecord = await SalaryHistory.findOne({ employeeId: req.params.empId })
                                            .sort({ createdAt: -1 });
        res.json({ lastDue: lastRecord ? lastRecord.dueAmount : 0 });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.paySalary = async (req, res) => {
    try {
        // Frontend theke date pathanor dorkar nai, MongoDB timestamps use korbe
        const newSalary = new SalaryHistory(req.body);
        await newSalary.save();
        res.json({ message: "Payment Recorded!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};



exports.saveAttendance = async (req, res) => {
    try {
        const { date, records } = req.body;

        // Ek-i date-e jodi agey record thake sheta delete kore notun ta save hobe (Update logic)
        await Attendance.deleteMany({ date });

        // Bulk insert records
        await Attendance.insertMany(records.map(r => ({
            employeeId: r.employeeId,
            date: date,
            status: r.status
        })));

        res.json({ message: "Attendance synced successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.checkAttendance = async (req, res) => {
    try {
        const { date } = req.query;
        const records = await Attendance.find({ date }).populate('employeeId', 'name');
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getHRStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Stats Calculation
        const totalEmployees = await Employee.countDocuments();
        const attendanceToday = await Attendance.find({ date: today });
        const presentToday = attendanceToday.filter(a => a.status === 'Present').length;
        const lateToday = attendanceToday.filter(a => a.status === 'Late').length;
        
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const payrolls = await SalaryHistory.find({ month: currentMonth });
        const totalPaid = payrolls.reduce((sum, p) => sum + p.paidAmount, 0);

        // 💸 Recent Activity Logic (Real Data)
        // Shorboshesh 3 ta salary payment
        const recentSalaries = await SalaryHistory.find()
            .populate('employeeId', 'name')
            .sort({ createdAt: -1 })
            .limit(3);

        // Ajker Late entries
        const recentLates = await Attendance.find({ date: today, status: 'Late' })
            .populate('employeeId', 'name')
            .limit(3);

        // Combine and Sort Activities
        const activities = [
            ...recentSalaries.map(s => ({
                id: s._id,
                task: "Salary Disbursed",
                staff: s.employeeId?.name || "Unknown",
                time: "Recently",
                type: "salary"
            })),
            ...recentLates.map(l => ({
                id: l._id,
                task: "Late Entry",
                staff: l.employeeId?.name || "Unknown",
                time: "Today",
                type: "late"
            }))
        ];

        res.json({
            totalEmployees,
            presentToday,
            lateToday,
            absentToday: totalEmployees - presentToday,
            monthlyCost: totalPaid,
            activities: activities.slice(0, 5) // Top 5 activities
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




exports.getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const employees = await Employee.find({}, "name position");
        
        const report = await Promise.all(employees.map(async (emp) => {
            const records = await Attendance.find({
                employeeId: emp._id,
                date: { $gte: startDate, $lte: endDate }
            });

            const counts = {
                Present: records.filter(r => r.status === 'Present').length,
                Absent: records.filter(r => r.status === 'Absent').length,
                Late: records.filter(r => r.status === 'Late').length,
                Leave: records.filter(r => r.status === 'Leave').length,
            };

            const totalDays = records.length;
            const attendancePercentage = totalDays > 0 
                ? ((counts.Present + counts.Late) / totalDays * 100).toFixed(1) 
                : 0;

            return {
                _id: emp._id,
                name: emp.name,
                position: emp.position,
                ...counts,
                totalDays,
                percentage: attendancePercentage
            };
        }));

        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};