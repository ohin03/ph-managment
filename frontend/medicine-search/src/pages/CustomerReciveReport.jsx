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

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#6366F1", "#EC4899"];

const CustomerReciveReport = () => {
  const [data, setData] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/customer-receive-report", { params: { from, to } });
      setData(res.data);
      setCurrentPage(1); // Reset to page 1 on new search
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, []);

  const formatMonth = (m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1] || m;

  // --- Pagination Logic ---
  const totalRecentRecords = data.recentReceives?.length || 0;
  const totalPages = Math.ceil(totalRecentRecords / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = data.recentReceives?.slice(indexOfFirstItem, indexOfLastItem) || [];

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 🚀 SMART HEADER & FILTER */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4 border-0 bg-dark-subtle">
        <div className="row align-items-center">
          <div className="col-lg-5">
            <h2 className="fw-900 text-danger mb-1" style={{ letterSpacing: '-1.5px' }}>💰 Collection Insights</h2>
            <p className="text-muted small fw-bold text-uppercase mb-0">Customer Payments & Revenue Tracking</p>
          </div>
          <div className="col-lg-7 d-flex gap-2 justify-content-lg-end mt-3 mt-lg-0">
            <div className="d-flex bg-light rounded-pill px-3 py-1 border shadow-inner">
              <div className="d-flex align-items-center me-2">
                <small className="fw-bold text-muted me-2">FROM</small>
                <input type="date" className="form-control border-0 bg-transparent fw-bold small" value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div className="vr my-2 opacity-25"></div>
              <div className="d-flex align-items-center ms-2">
                <small className="fw-bold text-muted me-2">TO</small>
                <input type="date" className="form-control border-0 bg-transparent fw-bold small" value={to} onChange={e => setTo(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-success rounded-pill px-4 fw-black shadow-sm" onClick={loadReport}>
              {loading ? "..." : "SYNC"}
            </button>
          </div>
        </div>
      </div>

      {/* 💰 BIG NUMBERS (KPI) */}
      <div className="row g-4 mb-4">
        {[
          { label: "Total Received", val: data.summary?.totalReceive, icon: "💵", color: "#10B981", sub: "Net Cash Inflow" },
          { label: "Transactions", val: data.summary?.totalTransactions, icon: "💳", color: "#3B82F6", sub: "Payment Events" }
        ].map((item, idx) => (
          <div className="col-md-6" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white transition-up">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge mb-2 rounded-pill px-3 py-2" style={{ backgroundColor: `${item.color}15`, color: item.color }}>{item.icon} {item.label}</span>
                  <h1 className="fw-900 mb-1" style={{ color: '#1E293B' }}>
                    {idx === 0 ? "৳ " : ""}{item.val?.toLocaleString() || 0}
                  </h1>
                  <small className="text-muted fw-bold">{item.sub}</small>
                </div>
                <div className="display-4 opacity-10">{item.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* 📈 MONTHLY COLLECTIONS */}
        <div className="col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-info-subtle h-100">
            <h6 className="fw-900 text-muted text-uppercase small mb-4">Collection Trend 📊</h6>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.monthlyReceive?.map(item => ({ month: formatMonth(item._id.month), total: item.total })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8'}} tickFormatter={v => `৳${v/1000}k`} />
                <Tooltip cursor={{fill: '#ECFDF5'}} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="total" fill="#10B981" radius={[10, 10, 10, 10]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍩 PAYMENT METHODS */}
        <div className="col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-900 text-muted text-uppercase small mb-4 text-center text-danger">Payment Channels ⚡</h6>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.paymentMethod || []}
                  dataKey="total"
                  nameKey="_id"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                >
                  {data.paymentMethod?.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 🏆 TOP CUSTOMERS */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 bg-success-subtle">
            <h6 className="fw-900 text-muted text-uppercase small mb-4 ">Top Contributors 🏆</h6>
            <div className="list-group list-group-flush">
              {data.topCustomers?.map((c, i) => (
                <div key={i} className="list-group-item border-0 px-0 d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-success me-3" style={{ width: '40px', height: '40px' }}>{i+1}</div>
                    <span className="fw-bold text-dark">{c._id}</span>
                  </div>
                  <span className="fw-900 text-success small">৳ {c.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📑 RECENT TRANSACTIONS WITH PAGINATION */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-900 text-uppercase small mb-4 text-success">Recent Receipts 🧾</h6>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr className="small text-muted text-uppercase fw-black">
                    <th className="border-0">Receipt No</th>
                    <th className="border-0">Customer</th>
                    <th className="border-0">Method</th>
                    <th className="border-0 text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((r, i) => (
                    <tr key={i} className="border-bottom">
                      <td className="fw-bold text-primary">#{r.receiptNo}</td>
                      <td className="fw-medium">{r.customerId?.name}</td>
                      <td><span className="badge rounded-pill bg-light text-dark border">{r.paymentMethod}</span></td>
                      <td className="text-end fw-900 text-success">৳ {r.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- PAGINATION CONTROLS --- */}
            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <small className="fw-bold text-muted">
                Page <span className="text-dark">{currentPage}</span> of <span className="text-dark">{totalPages || 1}</span>
              </small>
              <div className="btn-group">
                <button 
                  className="btn btn-sm btn-outline-secondary rounded-start-pill px-3" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Prev
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary rounded-end-pill px-3" 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fw-900 { font-weight: 900; }
        .transition-up { transition: 0.3s ease; }
        .transition-up:hover { transform: translateY(-8px); }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
        .form-control:focus { outline: none; box-shadow: none; }
        .btn-outline-secondary:disabled { border-color: #eee; color: #ccc; }
      `}</style>
    </div>
  );
};

export default CustomerReciveReport;