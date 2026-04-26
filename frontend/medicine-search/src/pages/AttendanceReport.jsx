import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../utils/token.util";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AttendanceReport = () => {
    const [report, setReport] = useState([]);
    const [dates, setDates] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']; // Present, Absent, Late, Leave

    const fetchReport = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const res = await axios.get(`http://localhost:5000/api/hr/attendance-report?startDate=${dates.start}&endDate=${dates.end}`, config);
            setReport(res.data);
        } catch (err) {
            toast.error("Failed to load analytics");
        }
    };

    useEffect(() => { fetchReport(); }, [dates]);

    // Calculate Total Summary for Pie Chart
    const summaryData = [
        { name: 'Present', value: report.reduce((s, e) => s + e.Present, 0) },
        { name: 'Absent', value: report.reduce((s, e) => s + e.Absent, 0) },
        { name: 'Late', value: report.reduce((s, e) => s + e.Late, 0) },
        { name: 'Leave', value: report.reduce((s, e) => s + e.Leave, 0) },
    ];

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">📈 Attendance Insights</h2>
                    <p className="text-muted">Visual data representation of staff performance</p>
                </div>
                <div className="d-flex gap-2 bg-white p-2 rounded-4 shadow-sm">
                    <input type="date" className="form-control border-0" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} />
                    <span className="align-self-center">to</span>
                    <input type="date" className="form-control border-0" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} />
                </div>
            </div>

            {/* Top Charts Section */}
            <div className="row g-4 mb-4">
                {/* Bar Chart: Individual Performance */}
                <div className="col-xl-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h5 className="fw-bold mb-4">Staff Performance Comparison</h5>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={report}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pie Chart: Overall Status */}
                <div className="col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 text-center">
                        <h5 className="fw-bold mb-2">Overall Distribution</h5>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={summaryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {summaryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                            {summaryData.map((s, i) => (
                                <small key={i}><span className="dot" style={{backgroundColor: COLORS[i]}}></span> {s.name}</small>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4 bg-white border-bottom">
                    <h5 className="fw-bold mb-0">Detailed Monthly Log</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="text-muted small">
                                <th className="ps-4 py-3">EMPLOYEE</th>
                                <th>PRESENT</th>
                                <th>ABSENT</th>
                                <th>LATE</th>
                                <th>EFFICIENCY</th>
                                <th className="text-center">REMARK</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.map(emp => (
                                <tr key={emp._id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-sm me-3 bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{width: 35, height: 35}}>
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold">{emp.name}</div>
                                                <small className="text-muted">{emp.position}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="fw-bold text-success">{emp.Present}</span></td>
                                    <td><span className="fw-bold text-danger">{emp.Absent}</span></td>
                                    <td><span className="fw-bold text-warning">{emp.Late}</span></td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="progress flex-grow-1" style={{ height: "6px", width: "80px" }}>
                                                <div className={`progress-bar ${emp.percentage > 85 ? 'bg-success' : emp.percentage > 60 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${emp.percentage}%` }}></div>
                                            </div>
                                            <span className="small fw-bold">{emp.percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge rounded-pill ${emp.percentage > 85 ? 'bg-success' : 'bg-danger'}-subtle ${emp.percentage > 85 ? 'text-success' : 'text-danger'} px-3`}>
                                            {emp.percentage > 85 ? 'High Performer' : 'Low Attendance'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style>{`
                .dot { height: 10px; width: 10px; border-radius: 50%; display: inline-block; margin-right: 5px; }
                .avatar-sm { font-size: 14px; }
            `}</style>
        </div>
    );
};

export default AttendanceReport;