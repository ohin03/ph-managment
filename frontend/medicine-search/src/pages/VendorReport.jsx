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

// Corporate & Trustworthy Colors
const COLORS = ["#0F172A", "#3B82F6", "#10B981", "#F59E0B", "#6366F1"];

const VendorReport = () => {
  const [data, setData] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/vendor-report", { params: { from, to } });
      setData(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, []);

  const formatMonth = (m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1] || m;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#F1F5F9", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 🏢 HEADER & SMART FILTER */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4 border-bottom border-4 border-primary">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div>
            <h2 className="fw-black text-dark mb-1">🏢 Vendor Financials</h2>
            <p className="text-muted mb-0 fw-medium">Analyze procurement and payables with ease.</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0 p-2 bg-light rounded-4 shadow-inner">
            <input type="date" className="form-control border-0 bg-transparent fw-bold" value={from} onChange={e => setFrom(e.target.value)} />
            <span className="align-self-center text-muted fw-bold">to</span>
            <input type="date" className="form-control border-0 bg-transparent fw-bold" value={to} onChange={e => setTo(e.target.value)} />
            <button className="btn btn-primary rounded-3 px-4 fw-bold shadow-sm" onClick={loadReport}>
              {loading ? "..." : "LOAD"}
            </button>
          </div>
        </div>
      </div>

      {/* 💰 FINANCIAL SUMMARY (BIG BOLD TILES) */}
      <div className="row g-4 mb-5">
        {[
          { label: "Purchase Value", val: data.summary?.totalAmount, icon: "📦", color: "#3B82F6" },
          { label: "Amount Paid", val: data.summary?.totalPaid, icon: "✅", color: "#10B981" },
          { label: "Pending Due", val: data.summary?.totalDue, icon: "⏳", color: "#EF4444" },
          { label: "Total Orders", val: data.summary?.totalTransactions, icon: "📑", color: "#6366F1" }
        ].map((item, idx) => (
          <div className="col-md-3" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white transition-hover">
              <div className="d-flex align-items-center mb-3">
                <span className="fs-3 me-2">{item.icon}</span>
                <span className="text-muted fw-bold text-uppercase small">{item.label}</span>
              </div>
              <h2 className="fw-black mb-0" style={{ color: item.color }}>
                {idx === 3 ? "" : "৳ "}{item.val?.toLocaleString() || 0}
              </h2>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* 📈 PROCUREMENT TREND (CLEAN BAR CHART) */}
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h5 className="fw-black m-0">Procurement Flow 📊</h5>
               <small className="text-muted fw-bold">Monthly Order Value</small>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.monthly?.map(item => ({ month: formatMonth(item._id.month), total: item.total })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} tickFormatter={v => `৳${v/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}} 
                  contentStyle={{ borderRadius: "15px", border: "none", boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="total" fill="#3B82F6" radius={[10, 10, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍩 VENDOR SPLIT (MODERN DONUT) */}
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-black mb-4 text-center">Top Supply Sources 🍕</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.topVendors?.map(v => ({ name: v.name, value: v.totalAmount })) || []}
                  dataKey="value"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  stroke="none"
                >
                  {data.topVendors?.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🏆 VENDOR RANKING LIST */}
      <div className="mt-5">
        <h4 className="fw-black text-dark mb-4">Vendor Leaderboard 🏅</h4>
        <div className="row g-3">
          {data.topVendors?.map((v, i) => (
            <div className="col-md-4 col-lg-3" key={i}>
              <div className="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-primary d-flex justify-content-between align-items-center transition-hover">
                <div>
                  <div className="text-muted small fw-bold text-uppercase">{v.name}</div>
                  <div className="fw-black text-dark fs-5">৳ {v.totalAmount.toLocaleString()}</div>
                </div>
                <div className="bg-light p-2 rounded-circle fw-bold text-primary">#{i+1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900; }
        .transition-hover:hover { transform: translateY(-5px); transition: 0.3s; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
        .form-control:focus { outline: none; box-shadow: none; }
      `}</style>
    </div>
  );
};

export default VendorReport;