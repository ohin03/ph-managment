import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";
import { toast, ToastContainer } from 'react-toastify';

const COLORS = ["#ff4d4f", "#ff7875", "#ffa39e", "#ffccc7", "#871112"];

const PurchaseReturnReport = () => {
  const [data, setData] = useState({ summary: {}, monthly: [], supplierWise: [] });
  const [returnList, setReturnList] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadReport = async () => {
    setLoading(true);
    try {
      const [reportRes, listRes] = await Promise.all([
        api.get("/reports/purchase-return-report", { params: { from, to } }),
        api.get("/purchase-returns")
      ]);
      setData(reportRes.data);
      setReturnList(listRes.data);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Network synchronization failed");
    }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, []);

  const filteredItems = useMemo(() => {
    if (!returnList.length) return [];
    return returnList.filter(item => {
      const d = item.returnDate;
      return (!from || d >= from) && (!to || d <= to);
    });
  }, [returnList, from, to]);

  const paginatedData = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const formatMonth = (m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] || m;

  return (
    <div className="report-glass-theme py-5 px-4" style={{ backgroundColor: "#fdf2f2", minHeight: "100vh" }}>
      <ToastContainer />
      
      {/* 🚀 NEON HEADER */}
      <div className="glass-header d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 p-4 bg-dark-subtle">
        <div>
          <h1 className="fw-black text-danger mb-0 dashboard-title">
            <span className="pulse-icon">●</span> RETURN ANALYTICS
          </h1>
          <p className="text-muted fw-bold mb-0">Operational Performance & Supplier Insight</p>
        </div>
        
        <div className="d-flex gap-3 mt-3 mt-md-0 glass-filter p-2 rounded-pill">
          <input type="date" className="date-input" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="divider text-danger">➤</span>
          <input type="date" className="date-input" value={to} onChange={e => setTo(e.target.value)} />
          <button className="btn-glow-danger" onClick={loadReport}>
            {loading ? "..." : "SYNC"}
          </button>
        </div>
      </div>

      {/* 📊 DYNAMIC SUMMARY CARDS */}
      <div className="row g-4 mb-5">
        {[
          { label: "Total Returns", val: data.summary?.totalReturns || 0, icon: "🔄", trend: "+12%" },
          { label: "Items Volume", val: data.summary?.totalReturnQty || 0, icon: "📦", trend: "High" },
          { label: "Suppliers Active", val: data.supplierWise?.length || 0, icon: "🏢", trend: "Normal" },
          { label: "Return Rate", val: data.summary?.totalReturns ? (data.summary.totalReturnQty / data.summary.totalReturns).toFixed(1) : 0, icon: "📈", trend: "Avg/Log" },
        ].map((item, idx) => (
          <div className="col-md-3" key={idx}>
            <div className="glass-card p-4 transition-up h-100">
              <div className="d-flex justify-content-between mb-3">
                <span className="icon-circle">{item.icon}</span>
                <span className="trend-badge">{item.trend}</span>
              </div>
              <h6 className="text-muted fw-bold small text-uppercase">{item.label}</h6>
              <h2 className="fw-black text-dark mb-0">{item.val.toLocaleString()}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-5">
        {/* 📈 HIGH-END PULSE GRAPH */}
        <div className="col-xl-8">
          <div className="glass-card p-4 h-100 bg-info-subtle">
            <h5 className="fw-black mb-4 text-secondary">| MONTHLY RETURN PULSE</h5>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.monthly?.map(item => ({ month: formatMonth(item._id.month), total: item.totalQty })) || []}>
                <defs>
                  <linearGradient id="pulseRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#666', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                   contentStyle={{ borderRadius: "15px", border: "none", boxShadow: "0 10px 30px rgba(255,0,0,0.1)" }}
                />
                <Area type="monotone" dataKey="total" stroke="#ff4d4f" strokeWidth={5} fillOpacity={1} fill="url(#pulseRed)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍩 DONUT ANALYTICS */}
        <div className="col-xl-4">
          <div className="glass-card p-4 h-100 bg-success-subtle">
            <h5 className="fw-black mb-4 text-center">Supplier Share</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.supplierWise?.map(s => ({ name: s._id, value: s.totalQty })) || []}
                  dataKey="value"
                  innerRadius={85}
                  outerRadius={115}
                  paddingAngle={8}
                >
                  {data.supplierWise?.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="wye" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 📜 LUXURY TABLE */}
      <div className="glass-card p-0 overflow-hidden shadow-lg border-0">
        <div className="p-4 bg-white d-flex justify-content-between align-items-center">
          <h4 className="fw-black mb-0">Detailed Return Logs</h4>
          <div className="pulse-indicator">LIVE UPDATING</div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-muted small fw-bold">
                <th className="ps-4">ID / INVOICE</th>
                <th>RETURN DATE</th>
                <th>SUPPLIER</th>
                <th className="text-center">QTY</th>
                <th className="text-end pe-4">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r) => (
                <tr key={r._id}>
                  <td className="ps-4 fw-black text-danger">#{r.invoiceNo}</td>
                  <td className="fw-bold">{r.returnDate}</td>
                  <td className="text-dark fw-semibold">{r.supplier}</td>
                  <td className="text-center">
                    <span className="badge-qty">{r.returnQty}</span>
                  </td>
                  <td className="text-end pe-4">
                    <span className="status-pill">Returned</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* MODERN PAGINATION */}
        <div className="p-4 d-flex justify-content-between align-items-center bg-white">
          <span className="text-muted small fw-bold">Displaying {paginatedData.length} of {filteredItems.length} records</span>
          <div className="d-flex gap-2">
            <button className="nav-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>PREV</button>
            <button className="nav-btn active" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>NEXT</button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        .report-glass-theme { font-family: 'Plus Jakarta Sans', sans-serif; }
        .fw-black { font-weight: 800; }
        
        .glass-header { background: white; border-radius: 40px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); }
        .glass-card { background: white; border-radius: 30px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 8px 30px rgba(0,0,0,0.03); }
        
        .dashboard-title { letter-spacing: -2px; }
        .pulse-icon { color: #ff4d4f; animation: blink 1.5s infinite; margin-right: 10px; font-size: 1.2rem; }
        
        .glass-filter { background: #f8f9fa; border: 1px solid #eee; }
        .date-input { border: none; background: transparent; font-weight: bold; color: #444; outline: none; }
        
        .btn-glow-danger { background: #ff4d4f; color: white; border: none; padding: 10px 25px; border-radius: 30px; font-weight: 800; transition: 0.3s; box-shadow: 0 4px 15px rgba(255,77,79,0.3); }
        .btn-glow-danger:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(255,77,79,0.5); }
        
        .icon-circle { background: #fff1f0; padding: 12px; border-radius: 18px; font-size: 1.5rem; }
        .trend-badge { background: #f6ffed; color: #52c41a; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; }
        
        .badge-qty { background: #ff4d4f; color: white; padding: 6px 15px; border-radius: 10px; font-weight: 900; font-size: 0.8rem; }
        .status-pill { background: #fff1f0; color: #ff4d4f; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.75rem; border: 1px solid #ffccc7; }
        
        .nav-btn { background: #f8f9fa; border: 1px solid #eee; padding: 8px 20px; border-radius: 15px; font-weight: bold; color: #666; transition: 0.3s; }
        .nav-btn.active { background: #ff4d4f; color: white; border-color: #ff4d4f; }
        
        .pulse-indicator { font-size: 0.7rem; font-weight: 800; color: #52c41a; display: flex; align-items: center; gap: 5px; }
        .pulse-indicator::before { content: ""; width: 8px; height: 8px; background: #52c41a; border-radius: 50%; animation: blink 1s infinite; }

        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .transition-up:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
      `}</style>
    </div>
  );
};

export default PurchaseReturnReport;