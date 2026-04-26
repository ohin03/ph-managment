import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";

const COLORS = ["#4338CA", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

const PurchaseReport = () => {
  const [data, setData] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadReport = async () => {
    try {
      const res = await api.get("/reports/purchase-report", { params: { from, to } });
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadReport(); }, []);

  const formatMonth = (m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1] || m;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#F3F4F6", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 🚀 TOP NAVIGATION & FILTERS */}
      <div className="bg-white p-4 rounded-4 shadow-sm border-0 mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h3 className="fw-900 text-slate-900 mb-1" style={{ letterSpacing: '-1px' }}>Inventory Intelligence</h3>
            <p className="text-muted small fw-medium mb-0 text-uppercase">Track your sourcing and supply chain</p>
          </div>
          <div className="col-md-6 d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
            <div className="d-flex bg-light rounded-3 p-1 border">
              <input type="date" className="form-control border-0 bg-transparent fw-bold small" value={from} onChange={e => setFrom(e.target.value)} />
              <input type="date" className="form-control border-0 bg-transparent fw-bold small" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <button className="btn btn-indigo px-4 fw-bold rounded-3" onClick={loadReport}>Update</button>
          </div>
        </div>
      </div>

      {/* 📊 CORE METRICS (BOLD & CLEAR) */}
      <div className="row g-4 mb-4">
        {[
          { label: "Total Purchases", val: data.summary?.totalPurchase, icon: "💰", color: "#4338CA" },
          { label: "Active Invoices", val: data.summary?.totalInvoices, icon: "📄", color: "#059669" }
        ].map((item, idx) => (
          <div className="col-md-6" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-badge" style={{ backgroundColor: `${item.color}15`, color: item.color }}>{item.icon}</div>
                <div>
                  <p className="text-muted small fw-bold text-uppercase mb-0">{item.label}</p>
                  <h2 className="fw-900 mb-0" style={{ color: '#1E293B' }}>
                    {idx === 0 ? "৳ " : ""}{item.val?.toLocaleString() || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* 📈 MONTHLY GROWTH BAR (CLEAN) */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h6 className="fw-900 text-uppercase text-muted small">Monthly Purchase Inflow</h6>
               <span className="badge bg-indigo-soft text-indigo">Real-time</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.monthly?.map(item => ({ month: formatMonth(item._id.month), total: item.total })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8'}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="total" fill="#4338CA" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍩 SUPPLIER RATIO (DONUT) */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 text-center">
            <h6 className="fw-900 text-uppercase text-muted small mb-4">Sourcing Mix</h6>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.supplierWise?.map(s => ({ name: s._id, value: s.total })) || []}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.supplierWise?.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🏆 TOP MEDICINES (CLEAN TILES) */}
      <div className="mt-4">
        <h5 className="fw-900 text-slate-900 mb-3 px-1">Top-Moving Inventory 🧪</h5>
        <div className="row g-3">
          {data.topMedicines?.map((m, i) => (
            <div className="col-md-4 col-lg" key={i}>
              <div className="bg-white p-3 rounded-4 shadow-sm border text-center transition-up">
                <div className="fw-bold text-indigo small mb-1">Rank #{i+1}</div>
                <h6 className="fw-900 text-dark text-truncate mb-1">{m._id}</h6>
                <div className="fw-bold text-muted small">{m.totalQty} Units</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .fw-900 { font-weight: 900; }
        .btn-indigo { background: #4338CA; color: white; border: none; transition: 0.3s; }
        .btn-indigo:hover { background: #3730A3; transform: translateY(-2px); }
        .icon-badge { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .bg-indigo-soft { background: #E0E7FF; color: #4338CA; font-weight: 800; font-size: 10px; text-transform: uppercase; padding: 5px 10px; }
        .transition-up { transition: 0.3s; cursor: pointer; }
        .transition-up:hover { transform: translateY(-5px); border-color: #4338CA !important; }
      `}</style>
    </div>
  );
};

export default PurchaseReport;