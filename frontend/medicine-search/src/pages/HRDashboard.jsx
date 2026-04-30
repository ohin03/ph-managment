import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

const HRDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ 
        totalEmployees: 0, 
        presentToday: 0, 
        absentToday: 0, 
        lateToday: 0,
        monthlyCost: 0,
        activities: [] 
    });
    const [loading, setLoading] = useState(true);

    // Memoized fetch function jate bar bar create na hoy
    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get("/hr/hr-stats");
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Dashboard Sync Error:", err);
            setLoading(false);
        }
    }, []);

    // Effect to fetch on mount and setup auto-refresh (optional but pro)
    useEffect(() => {
        fetchStats();
        
        // Live feel er jonno protik 30 sec por por auto-update hobe background-e
        const interval = setInterval(fetchStats, 30000); 
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Percent Calculations
    const total = stats.totalEmployees || 0;
    const presentWidth = total > 0 ? (stats.presentToday / total) * 100 : 0;
    const lateWidth = total > 0 ? (stats.lateToday / total) * 100 : 0;
    const absentWidth = total > 0 ? (stats.absentToday / total) * 100 : 0;

    const metrics = [
        { title: "Team Strength", value: stats.totalEmployees, sub: "Active Staff", icon: "👥", color: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
        { title: "On-Duty", value: stats.presentToday, sub: "Present Now", icon: "⚡", color: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)" },
        { title: "Late Entry", value: stats.lateToday, sub: "Today's Late", icon: "🕒", color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
        { title: "Payroll Month", value: `৳${stats.monthlyCost.toLocaleString()}`, sub: "Total Paid", icon: "💰", color: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
    ];

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            {/* --- Top Header --- */}
            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-between align-items-center bg-white p-4 rounded-4 shadow-sm border-0">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                            <i className="fa fa-chart-line text-primary fs-4"></i>
                        </div>
                        <div>
                            <h2 className="fw-bold text-dark mb-0">Pharmacy HR Intelligence</h2>
                            <p className="text-muted mb-0 small"><span className="text-success">●</span> Live Data Synchronization Active</p>
                        </div>
                    </div>
                    <div className="text-end">
                        <button className="btn btn-light rounded-pill px-3 me-2" onClick={fetchStats}>
                            <i className={`fa fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                        </button>
                        <div className="fw-bold text-dark">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                </div>
            </div>

            {/* --- Metrics Grid --- */}
            <div className="row g-4 mb-4">
                {metrics.map((m, i) => (
                    <div className="col-xl-3 col-sm-6" key={i}>
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ background: m.color, transition: 'transform 0.3s' }}>
                            <div className="card-body text-white p-4">
                                <div className="d-flex justify-content-between mb-3">
                                    <div className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                        <span className="fs-5">{m.icon}</span>
                                    </div>
                                    <span className="badge bg-white bg-opacity-25 rounded-pill h-50 mt-1 small">Realtime</span>
                                </div>
                                <h2 className="fw-bolder mb-0">{m.value}</h2>
                                <p className="opacity-75 mb-0 small fw-bold text-uppercase tracking-wider">{m.title}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* --- Main Management (Left) --- */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center">
                                <span className="bg-primary p-1 rounded me-2" style={{ width: '5px', height: '20px' }}></span>
                                Operations Hub
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <Link to="/hr/payroll" className="text-decoration-none">
                                        <div className="p-4 rounded-4 border border-2 border-light bg-hover-light d-flex align-items-center transition shadow-hover" style={{ background: '#fff' }}>
                                            <div className="bg-primary text-white rounded-4 p-3 me-3 shadow">💵</div>
                                            <div>
                                                <h6 className="fw-bold mb-0 text-dark">Salary & Dues</h6>
                                                <small className="text-muted">Manage payments</small>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-md-6">
                                    <Link to="/hr/attendance" className="text-decoration-none">
                                        <div className="p-4 rounded-4 border border-2 border-light bg-hover-light d-flex align-items-center transition shadow-hover" style={{ background: '#fff' }}>
                                            <div className="bg-success text-white rounded-4 p-3 me-3 shadow">📅</div>
                                            <div>
                                                <h6 className="fw-bold mb-0 text-dark">Staff Roster</h6>
                                                <small className="text-muted">Track attendance</small>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Analysis */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Distribution Metrics</h5>
                            <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={() => navigate('/hr/attendance')}>Detailed Report</button>
                        </div>
                        <div className="progress-stacked" style={{ height: '40px', borderRadius: '15px', padding: '5px', backgroundColor: '#f1f5f9' }}>
                            <div className="progress" style={{ width: `${presentWidth}%` }}>
                                <div className="progress-bar bg-success rounded-pill">Present</div>
                            </div>
                            <div className="progress" style={{ width: `${lateWidth}%` }}>
                                <div className="progress-bar bg-warning text-dark rounded-pill">Late</div>
                            </div>
                            <div className="progress" style={{ width: `${absentWidth}%` }}>
                                <div className="progress-bar bg-danger rounded-pill">Absent</div>
                            </div>
                        </div>
                        <div className="row mt-4 text-center">
                            <div className="col border-end"><h6 className="mb-0 fw-bold">{Math.round(presentWidth)}%</h6><small className="text-muted">Presence</small></div>
                            <div className="col border-end"><h6 className="mb-0 fw-bold">{Math.round(lateWidth)}%</h6><small className="text-muted">Late Rate</small></div>
                            <div className="col"><h6 className="mb-0 fw-bold">{Math.round(absentWidth)}%</h6><small className="text-muted">Vacant</small></div>
                        </div>
                    </div>
                </div>

                {/* --- PRO LIVE ACTIVITY FEED (Right) --- */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white overflow-hidden">
                        <div className="card-header bg-white border-0 p-4 pb-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0">Live Activity Feed</h5>
                                <span className="badge bg-soft-primary text-primary rounded-pill">Recent 5</span>
                            </div>
                        </div>
                        <div className="card-body p-4 pt-4">
                            <div className="activity-feed">
                                {stats.activities && stats.activities.length > 0 ? (
                                    stats.activities.map((act, i) => (
                                        <div className="d-flex mb-4 align-items-start" key={i}>
                                            <div className={`p-2 rounded-3 me-3 shadow-sm flex-shrink-0 ${act.type === 'salary' ? 'bg-primary-subtle' : 'bg-warning-subtle'}`} style={{ width: '42px', height: '42px', textAlign: 'center' }}>
                                                {act.type === 'salary' ? '💰' : '🕒'}
                                            </div>
                                            <div className="flex-grow-1 border-bottom pb-3">
                                                <div className="d-flex justify-content-between">
                                                    <h6 className="fw-bold mb-1 text-dark small">{act.task}</h6>
                                                    <small className="text-muted" style={{ fontSize: '0.65rem' }}>{act.time}</small>
                                                </div>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Staff: <span className="text-dark fw-semibold">{act.staff}</span></p>
                                                <div className="d-flex align-items-center mt-1">
                                                    <span className={`badge ${act.type === 'salary' ? 'bg-success' : 'bg-warning'} p-1 me-1 rounded-circle`} style={{ width: '6px', height: '6px' }}></span>
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>Verified Transaction</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="fs-1 opacity-25">📡</div>
                                        <p className="text-muted small mt-2">Waiting for live activities...</p>
                                    </div>
                                )}
                            </div>
                            <button className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm transition-all" onClick={() => navigate('/hr/payroll')}>
                                View All Transactions ➔
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;