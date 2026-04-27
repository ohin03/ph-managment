import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  FaMoneyBillWave, FaShoppingCart, FaUsers, FaPlusCircle, 
  FaFileInvoiceDollar, FaChartBar, FaCalendarAlt, FaBell, FaUserCircle, FaArrowUp
} from 'react-icons/fa';
import { getDashboardData } from "../api/dashboardApi";
import { useAuth } from "../context/AuthContext";

import "./Dashboard.css";

const COLORS = ['#4318FF', '#6AD2FF', '#05CD99', '#EE5D50', '#707EAE'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const todaysDate = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(todaysDate);
  const [data, setData] = useState({
    totalOrders: 0, totalMedicines: 0, totalCustomers: 0, totalSuppliers: 0,
    todaysSales: 0, yesterdaySales: 0, monthlySalesData: [], categoryData: [],
    recentSales: [], totalRevenue: 0, averageSale: 0, topMedicines: [], topCustomers: []
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const dashboardData = await getDashboardData(filterDate); 
      setData(dashboardData);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white">
        <div className="spinner-grow text-primary" role="status" style={{width: '3rem', height: '3rem'}}></div>
        <h5 className="mt-3 fw-bold text-primary animate-pulse">Initializing System...</h5>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-lg-4" style={{ backgroundColor: "#F7F9FC", minHeight: "100vh" }}>
      
      {/* --- PREMIUM TOP BAR --- */}
      <div className="row align-items-center mb-4 g-3">
        <div className="col-md-6 col-12 text-start">
          <h2 className="fw-extrabold text-dark mb-0" style={{ letterSpacing: '-1px' }}>Main Dashboard</h2>
          <p className="text-muted fw-medium">Welcome, <span className="text-primary fw-bold">{role || 'Administrator'}</span></p>
        </div>

        <div className="col-md-6 col-12">
          <div className="d-flex align-items-center justify-content-md-end gap-3 flex-wrap">
            {/* Custom Date Picker Wrapper */}
            <div className="glass-date-picker shadow-sm border px-3 py-2 rounded-pill bg-white d-flex align-items-center">
              <FaCalendarAlt className="text-primary me-2" />
              <input 
                type="date" 
                className="border-0 bg-transparent fw-bold text-dark small" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ outline: 'none', cursor: 'pointer' }}
              />
            </div>
            <div className="icon-badge-box shadow-sm border bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', cursor: 'pointer' }}>
              <FaBell className="text-secondary" />
            </div>
            <div className="profile-pill shadow-sm border bg-white rounded-pill px-3 py-1 d-flex align-items-center gap-2">
              <FaUserCircle className="fs-4 text-primary" />
              <span className="fw-bold small d-none d-sm-inline">Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- KPI SECTION (SaaS Style) --- */}
      <div className="row g-4 mb-4">
        {[
          { label: filterDate === todaysDate ? "Today's Revenue" : "Selected Date Revenue", val: `৳${data.todaysSales}`, icon: <FaMoneyBillWave />, color: "#4318FF", trend: "+12%" },
          { label: "Monthly Sales", val: data.totalOrders, icon: <FaShoppingCart />, color: "#39B7FF", trend: "+5%" },
          { label: "New Customers", val: data.totalCustomers, icon: <FaUsers />, color: "#05CD99", trend: "+8%" },
          { label: "Total Volume", val: `৳${data.totalRevenue.toLocaleString()}`, icon: <FaFileInvoiceDollar />, color: "#EE5D50", trend: "+15%" }
        ].map((kpi, i) => (
          <div className="col-xl-3 col-md-6" key={i}>
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden kpi-card">
              <div className="card-body p-4 position-relative">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted fw-bold small text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{kpi.label}</p>
                    <h3 className="fw-extrabold mb-0 text-dark">{kpi.val}</h3>
                    <span className="text-success small fw-bold"><FaArrowUp className="me-1"/>{kpi.trend}</span>
                  </div>
                  <div className="kpi-icon-box shadow-sm" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                    {kpi.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- DUE ANALYTICS KPI --- */}
      <div className="row g-4 mb-4">
        {[
          { label: filterDate === todaysDate ? "Today's Due" : "Selected Date Due", val: `৳${data.selectedDateDue || 0}`, icon: <FaMoneyBillWave />, color: "#ff9900", trend: "" },
          { label: "This Month Due", val: `৳${data.selectedMonthDue || 0}`, icon: <FaCalendarAlt />, color: "#ff6600", trend: "" },
          { label: "Total Due Overall", val: `৳${data.totalDue || 0}`, icon: <FaFileInvoiceDollar />, color: "#ff3300", trend: "" },
        ].map((kpi, i) => (
          <div className="col-xl-4 col-md-6" key={i}>
            <div className={`card border-0 shadow-sm rounded-4 overflow-hidden kpi-card`} style={{ borderLeft: `4px solid ${kpi.color}` }}>
              <div className="card-body p-4 position-relative">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted fw-bold small text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>{kpi.label}</p>
                    <h3 className="fw-extrabold mb-0 text-dark">{kpi.val}</h3>
                  </div>
                  <div className="kpi-icon-box shadow-sm" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                    {kpi.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* --- MAIN ANALYTICS CHART --- */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold text-dark mb-0">Sales Flow Analytics</h5>
                <p className="text-muted small mb-0">Real-time revenue stream tracking</p>
              </div>
              <div className="chart-filter px-3 py-1 bg-light rounded-pill border fw-bold small">Current Year</div>
            </div>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={data.monthlySalesData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4318FF" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F4F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 12, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} 
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTION PANEL --- */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-dark text-white position-relative overflow-hidden">
            <div className="position-relative z-3">
              <h5 className="fw-bold mb-3">Quick Navigation</h5>
              <p className="small text-light opacity-75 mb-4">Jump directly to core pharmacy operations.</p>
              <div className="d-grid gap-3">
                <button onClick={() => navigate('/sales-entry')} className="btn glass-btn py-3 rounded-4 d-flex align-items-center justify-content-center gap-2 fw-bold shadow">
                  <FaPlusCircle /> Create New Sale
                </button>
                <button onClick={() => navigate('/reports/sales-report')} className="btn btn-primary py-3 rounded-4 fw-bold border-0 shadow" style={{ backgroundColor: '#4318FF' }}>
                  <FaChartBar className="me-2" /> Global Reports
                </button>
                <div className="mt-2 p-3 bg-white bg-opacity-10 rounded-4 border border-white border-opacity-10">
                  <p className="fw-bold small mb-1 text-info">Insights for you</p>
                  <p className="small text-light mb-0">Average customer value is up by 15% this month.</p>
                </div>
              </div>
            </div>
            {/* Decorative Background Elements */}
            <div className="deco-circle-1"></div>
            <div className="deco-circle-2"></div>
          </div>
        </div>
      </div>

      {/* --- TABLES SECTION --- */}
      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="p-4 d-flex justify-content-between align-items-center border-bottom">
              <h5 className="fw-bold mb-0">Recent Transactions</h5>
              <span className="badge bg-light text-primary rounded-pill px-3 py-2 cursor-pointer fw-bold border">Full History</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr className="text-secondary small text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>
                    <th className="ps-4 py-3 border-0">Invoice</th>
                    <th className="py-3 border-0">Customer</th>
                    <th className="py-3 border-0">Amount</th>
                    <th className="py-3 border-0 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSales.map((sale, i) => (
                    <tr key={i} className="border-bottom-0">
                      <td className="ps-4 py-3 fw-bold text-dark">#{sale.id}</td>
                      <td className="text-secondary fw-medium">{sale.customer}</td>
                      <td className="fw-extrabold text-dark">৳{sale.amount.toLocaleString()}</td>
                      <td className="text-center">
                        <span className={`status-pill ${sale.status === 'Paid' ? 'status-paid' : 'status-pending'}`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <h5 className="fw-bold mb-4">🏆 Top Performance</h5>
            <div className="d-flex flex-column gap-4">
              {data.topMedicines.slice(0, 5).map((med, i) => (
                <div key={i} className="ranking-item">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <div className={`rank-dot bg-opacity-25 rounded-circle`} style={{ width: '8px', height: '8px', backgroundColor: COLORS[i] }}></div>
                      <span className="fw-bold text-dark small">{med.name}</span>
                    </div>
                    <span className="text-muted fw-bold small" style={{ fontSize: '0.7rem' }}>{med.sold} Units</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: '8px', backgroundColor: '#F4F7FE' }}>
                    <div className="progress-bar rounded-pill" 
                         style={{ backgroundColor: COLORS[i], width: `${(med.sold/data.topMedicines[0].sold)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .fw-extrabold { font-weight: 800; }
        
        .kpi-card { transition: all 0.3s ease; border: 1px solid transparent !important; }
        .kpi-card:hover { transform: translateY(-10px); border-color: #4318FF !important; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1) !important; }
        
        .kpi-icon-box { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; fontSize: 1.5rem; transition: 0.3s; }
        .kpi-card:hover .kpi-icon-box { transform: scale(1.1) rotate(10deg); }

        .glass-btn { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); color: white; transition: 0.3s; }
        .glass-btn:hover { background: rgba(255, 255, 255, 0.2); color: white; }

        .status-pill { padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-paid { background-color: #E6FFF5; color: #00A389; }
        .status-pending { background-color: #FFF9E6; color: #FFB547; }

        .deco-circle-1 { position: absolute; width: 150px; height: 150px; background: #4318FF; filter: blur(80px); top: -50px; right: -50px; opacity: 0.4; }
        .deco-circle-2 { position: absolute; width: 100px; height: 100px; background: #39B7FF; filter: blur(60px); bottom: -20px; left: -20px; opacity: 0.3; }
        
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        
        .table thead th { font-size: 0.65rem; }
        .hover-bg-light:hover { background-color: #F7F9FC; transition: 0.2s; }
      `}</style>
    </div>
  );
}