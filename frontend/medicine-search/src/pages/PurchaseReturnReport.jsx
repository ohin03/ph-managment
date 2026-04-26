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

// Modern & High-Contrast Colors
const COLORS = ["#ff4d4f", "#ff7875", "#ffa39e", "#ffccc7", "#871112"];

const PurchaseReturnReport = () => {
  const [data, setData] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/purchase-return-report", { params: { from, to } });
      setData(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, []);

  const formatMonth = (m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1] || m;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#fff1f0", minHeight: "100vh" }}>
      
      {/* 🚀 HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 bg-white p-4 rounded-5 shadow-sm">
        <div>
          <h1 className="fw-black text-danger mb-0" style={{ fontSize: '2.4rem', letterSpacing: '-1.5px' }}>↩ Return Hub</h1>
          <p className="text-muted fw-bold mb-0">Procurement Reversal & Supplier Analytics</p>
        </div>
        
        {/* SMART DATE PICKER */}
        <div className="d-flex gap-2 mt-3 mt-md-0 p-2 bg-light rounded-pill border shadow-inner">
          <input type="date" className="form-control border-0 bg-transparent fw-bold" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="align-self-center fw-black text-danger">TO</span>
          <input type="date" className="form-control border-0 bg-transparent fw-bold" value={to} onChange={e => setTo(e.target.value)} />
          <button className="btn btn-danger rounded-pill px-4 fw-black shadow" onClick={loadReport}>
            {loading ? "..." : "FETCH"}
          </button>
        </div>
      </div>

      {/* 📊 SUMMARY TILES (Visual Impact) */}
      <div className="row g-4 mb-5">
        {[
          { label: "Total Return Events", val: data.summary?.totalReturns || 0, icon: "🔄", color: "#ff4d4f" },
          { label: "Quantity Sent Back", val: data.summary?.totalReturnQty || 0, icon: "📦", color: "#fa8c16" },
        ].map((item, idx) => (
          <div className="col-md-6" key={idx}>
            <div className="card border-0 shadow-sm rounded-5 p-4 bg-white position-relative overflow-hidden transition-up">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-bold text-uppercase small">{item.label}</h6>
                  <h1 className="fw-black mb-0" style={{ fontSize: '3.5rem', color: item.color }}>{item.val.toLocaleString()}</h1>
                </div>
                <div className="display-2 opacity-25">{item.icon}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '8px', background: item.color }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* 📈 MONTHLY TREND (BOLD BAR CHART) */}
        <div className="col-xl-7">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-white h-100">
            <h4 className="fw-black mb-4"><span className="text-danger">|</span> Return Flow per Month</h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.monthly?.map(item => ({ month: formatMonth(item._id.month), total: item.totalQty })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                   cursor={{fill: '#fff1f0'}} 
                   contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="total" fill="#ff4d4f" radius={[15, 15, 15, 15]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍩 SUPPLIER ANALYSIS (CLEAN DONUT) */}
        <div className="col-xl-5">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-white h-100">
            <h4 className="fw-black mb-4 text-center">Supplier Wise Breakdown 🏢</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.supplierWise?.map(s => ({ name: s._id, value: s.totalQty })) || []}
                  dataKey="value"
                  innerRadius={80}
                  outerRadius={115}
                  paddingAngle={8}
                  stroke="none"
                >
                  {data.supplierWise?.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={12} />
                  ))}
                </Pie>
                <Tooltip cornerRadius={15} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🏆 QUICK LIST (Visual Ranking) */}
      <div className="mt-5">
        <h3 className="fw-black text-dark mb-4 px-2">Supplier Return Ranking</h3>
        <div className="row g-3">
            {data.supplierWise?.map((s, i) => (
                <div className="col-md-3" key={i}>
                    <div className="p-4 bg-white rounded-5 shadow-sm text-center transition-up border">
                        <div className="badge bg-danger mb-2 rounded-pill px-3">Rank #{i+1}</div>
                        <h5 className="fw-bold text-dark text-truncate">{s._id}</h5>
                        <div className="display-6 fw-black text-danger">{s.totalQty}</div>
                        <small className="text-muted fw-bold">Items Returned</small>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900; }
        .rounded-5 { border-radius: 35px !important; }
        .transition-up { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .transition-up:hover { transform: translateY(-12px); box-shadow: 0 25px 50px -12px rgba(255, 77, 79, 0.2) !important; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
        .form-control:focus { outline: none; box-shadow: none; }
      `}</style>
    </div>
  );
};

export default PurchaseReturnReport;