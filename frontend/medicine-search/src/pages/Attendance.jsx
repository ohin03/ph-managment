import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getToken } from "../utils/token.util";

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };

    // 1. Fetch Employees & Attendance (Logical Sync)
    const fetchAttendanceData = useCallback(async () => {
        try {
            const empRes = await axios.get("http://localhost:5000/api/hr/employees", config);
            setEmployees(empRes.data);

            const attRes = await axios.get(`http://localhost:5000/api/hr/attendance-check?date=${date}`, config);
            
            let initial = {};
            if (attRes.data && attRes.data.length > 0) {
                attRes.data.forEach(rec => {
                    initial[rec.employeeId._id || rec.employeeId] = rec.status;
                });
            } else {
                empRes.data.forEach(emp => initial[emp._id] = 'Present');
            }
            setAttendanceData(initial);
        } catch (err) {
            console.error("Fetch Error", err);
            toast.error("Failed to load attendance data");
        }
    }, [date]);

    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    const handleStatusChange = (empId, status) => {
        setAttendanceData(prev => ({ ...prev, [empId]: status }));
    };

    const submitAttendance = async () => {
        try {
            const payload = {
                date,
                records: Object.keys(attendanceData).map(id => ({
                    employeeId: id,
                    status: attendanceData[id]
                }))
            };
            await axios.post("http://localhost:5000/api/hr/attendance-save", payload, config);
            toast.success(`🎯 Attendance for ${date} Synced!`);
        } catch (err) { 
            toast.error("Submission Failed!"); 
        }
    };

    return (
        <div className="container py-4" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <div className="card shadow-lg border-0 rounded-4">
                {/* Header Section */}
                <div className="card-header bg-white py-4 px-4 border-bottom-0 rounded-top-4">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h3 className="fw-bold text-dark mb-1">Daily Staff Attendance</h3>
                            <p className="text-muted small mb-0">Track and manage employee daily presence</p>
                        </div>
                        <div className="col-md-6 d-flex justify-content-md-end gap-3 mt-3 mt-md-0">
                            <div className="input-group w-50 shadow-sm rounded-pill">
                                <span className="input-group-text bg-white border-0 ps-3">📅</span>
                                <input type="date" className="form-control border-0 fw-bold" 
                                    value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <button className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm" onClick={submitAttendance}>
                                Save Records
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="text-muted small text-uppercase">
                                    <th className="ps-4 py-3">Staff Profile</th>
                                    <th>Designation</th>
                                    <th className="text-center">Status Selection</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                {/* Avatar Component */}
                                                <div className="avatar me-3 d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                                                     style={{ 
                                                         width: '45px', height: '45px', 
                                                         borderRadius: '12px', 
                                                         backgroundColor: '#eef2ff', color: '#4f46e5',
                                                         fontSize: '18px'
                                                     }}>
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{emp.name}</div>
                                                    <small className="text-muted">ID: {emp._id.slice(-6).toUpperCase()}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-secondary rounded-pill px-3 py-2 border">
                                                {emp.position || "Staff"}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            {/* Status Selector with dynamic styling */}
                                            <select 
                                                className={`form-select form-select-sm w-75 mx-auto rounded-3 fw-bold shadow-sm ${
                                                    attendanceData[emp._id] === 'Present' ? 'border-success text-success' : 
                                                    attendanceData[emp._id] === 'Absent' ? 'border-danger text-danger' : 
                                                    'border-warning text-warning'
                                                }`}
                                                value={attendanceData[emp._id] || 'Present'}
                                                onChange={(e) => handleStatusChange(emp._id, e.target.value)}
                                            >
                                                <option value="Present">✅ Present</option>
                                                <option value="Absent">❌ Absent</option>
                                                <option value="Late">⏰ Late</option>
                                                <option value="Leave">🌴 Leave</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Footer Sync Status */}
                <div className="card-footer bg-light py-3 px-4 border-top-0 text-center rounded-bottom-4">
                    <small className="text-muted">Currently managing attendance for: <strong>{new Date(date).toDateString()}</strong></small>
                </div>
            </div>
        </div>
    );
};

export default Attendance;