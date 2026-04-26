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
} from "recharts";

// Return Report-er jonno "Warning" ar "Alert" colors gulo premium bhabe use kora hoyeche
const COLORS = ["#EF4444", "#F59E0B", "#6366F1", "#10B981", "#EC4899"];

const SalesReturnReport = () => {
  const [data, setData] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/sales-return-report", { params: { from, to } });
      setData(res.data);
    } catch (err) {
      console.error("Return report failed:", err);
    }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, []);

  const formatMonth = (m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1] || m;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#FEF2F2", minHeight: "100vh" }}>
      
      {/* 🚀 HEADER: TITLE & SMART FILTER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 bg-white p-4 rounded-4 shadow-sm border-start border-5 border-danger">
        <div>
          <h1 className="fw-black text-danger mb-0" style={{ letterSpacing: '-1.5px' }}>📦 Return Analytics</h1>
          <p className="text-muted fw-bold mb-0 font-monospace text-uppercase small">Tracking Product Reversals & Losses</p>
        </div>
        
        <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center bg-light p-2 rounded-pill shadow-inner">
          <input type="date" className="form-control border-0 bg-transparent shadow-none fw-bold" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="fw-black text-danger">→</span>
          <input type="date" className="form-control border-0 bg-transparent shadow-none fw-bold" value={to} onChange={e => setTo(e.target.value)} />
          <button className="btn btn-danger rounded-pill px-4 fw-black shadow-sm" onClick={loadReport}>
            {loading ? "..." : "REFRESH"}
          </button>
        </div>
      </div>

      {/* 📊 SUMMARY CARDS: BIG & BOLD */}
      <div className="row g-4 mb-5">
        {[
          { label: "Return Amount", val: `৳ ${data.summary?.totalReturnAmount || 0}`, icon: "📉", color: "#EF4444" },
          { label: "Return Cases", val: data.summary?.totalTransactions || 0, icon: "🔄", color: "#F59E0B" },
          { label: "Items Back", val: data.summary?.totalItemsReturned || 0, icon: "📦", color: "#6366F1" }
        ].map((item, idx) => (
          <div className="col-lg-4" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center transition-up position-relative overflow-hidden h-100 bg-white">
              <div className="fs-1 mb-2">{item.icon}</div>
              <h6 className="text-muted fw-bold text-uppercase small">{item.label}</h6>
              <h1 className="fw-black mb-0" style={{ color: item.color }}>{item.val.toLocaleString()}</h1>
              <div style={{ height: '5px', width: '40%', background: item.color, margin: '15px auto 0', borderRadius: '10px' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* 📈 MONTHLY RETURN (BAR CHART - SIMPLIFIED) */}
        <div className="col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-black mb-4"><span className="text-danger">|</span> Monthly Return Trend</h5>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.monthlyReturns?.map(item => ({ month: formatMonth(item._id.month), total: item.total })) || []}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip 
                   cursor={{fill: '#F1F5F9'}} 
                   contentStyle={{ borderRadius: "15px", border: "none", boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}
                   formatter={(val) => [`৳ ${val}`, 'Returned']}
                />
                <Bar dataKey="total" fill="#EF4444" radius={[10, 10, 10, 10]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍩 TOP RETURNED ITEMS (MODERN PIE) */}
        <div className="col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-black mb-4 text-center"><span className="text-danger">|</span> Bad Inventory (Returned)</h5>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.topReturnedMedicines?.map(m => ({ name: m._id, value: m.totalQuantity })) || []}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  stroke="none"
                >
                  {data.topReturnedMedicines?.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip cornerRadius={12} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🏆 TOP RETURNED MEDICINES (BIG BUBBLES) */}
      <div className="mt-5">
        <h4 className="fw-black text-dark mb-4">Top Returned Medicines (Quick View)</h4>
        <div className="row g-3">
            {data.topReturnedMedicines?.map((m, i) => (
                <div className="col-md-4 col-lg-2" key={i}>
                    <div className="p-3 bg-white rounded-4 border-bottom border-4 border-danger shadow-sm text-center transition-up">
                        <div className="fw-black text-danger fs-5 mb-1">{m.totalQuantity}</div>
                        <div className="text-muted fw-bold small text-truncate">{m._id}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .fw-black { font-weight: 900; }
        .transition-up { transition: all 0.3s ease; }
        .transition-up:hover { transform: translateY(-10px); }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        .form-control:focus { outline: none; box-shadow: none; }
      `}</style>
    </div>
  );
};

export default SalesReturnReport;