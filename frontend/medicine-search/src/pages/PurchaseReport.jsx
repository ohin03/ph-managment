import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, AreaChart, Area
} from "recharts";
import { toast, ToastContainer } from 'react-toastify';

const PurchaseReport = () => {
  const [data, setData] = useState({});
  const [purchaseList, setPurchaseList] = useState([]);
  const [from, setFrom] = useState(new Date().toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  // 📄 Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadReport = async () => {
    try {
      setLoading(true);
      const [reportRes, listRes] = await Promise.all([
        api.get("/reports/purchase-report", { params: { from, to } }),
        api.get("/purchases") 
      ]);
      setData(reportRes.data);
      setPurchaseList(listRes.data);
      setCurrentPage(1); 
    } catch (err) {
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  // 🔥 Filter Logic
  const filteredPurchases = useMemo(() => {
    if (!from || !to) return purchaseList;
    return purchaseList.filter(p => {
      const pDate = new Date(p.purchaseDate).toISOString().split('T')[0];
      return pDate >= from && pDate <= to;
    });
  }, [purchaseList, from, to]);

  // 🔥 Daily Pulse Logic: রাত ১টার ডাটা ফিক্স করা হয়েছে
  const dailyPulseData = useMemo(() => {
    const hours = ["12am", "04am", "08am", "12pm", "04pm", "08pm", "11pm"];
    const pulseMap = { "12am": 0, "04am": 0, "08am": 0, "12pm": 0, "04pm": 0, "08pm": 0, "11pm": 0 };

    filteredPurchases.forEach(p => {
      // createdAt থাকলে নিখুঁত সময় পাওয়া যাবে, নাহলে purchaseDate
      const dateSource = p.createdAt || p.purchaseDate;
      const hour = new Date(dateSource).getHours();

      if (hour >= 0 && hour < 4) pulseMap["12am"] += p.grandTotal; // রাত ১টা এখানে সেট হবে
      else if (hour >= 4 && hour < 8) pulseMap["04am"] += p.grandTotal;
      else if (hour >= 8 && hour < 12) pulseMap["08am"] += p.grandTotal;
      else if (hour >= 12 && hour < 16) pulseMap["12pm"] += p.grandTotal;
      else if (hour >= 16 && hour < 20) pulseMap["04pm"] += p.grandTotal;
      else if (hour >= 20 && hour < 23) pulseMap["08pm"] += p.grandTotal;
      else pulseMap["11pm"] += p.grandTotal;
    });

    return hours.map(h => ({ time: h, value: pulseMap[h] }));
  }, [filteredPurchases]);

  // 📄 Pagination Calculation
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(start, start + itemsPerPage);
  }, [filteredPurchases, currentPage]);

  const formatMonth = (m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1] || m;

  return (
    <div className="report-container py-5">
      <ToastContainer />
      <div className="container">
        
        {/* HEADER & FILTER */}
        <div className="header-card mb-5 p-4 d-flex flex-wrap justify-content-between align-items-center shadow-sm bg-dark-subtle">
          <div>
            <h2 className="fw-bold text-success mb-1">Purchase Analytics</h2>
            <p className="text-muted small fw-bold text-uppercase m-0">Sourcing Intelligence Dashboard</p>
          </div>
          
          <div className="filter-panel d-flex align-items-center gap-3 shadow-sm">
            <div className="d-flex flex-column px-3 border-end">
              <label className="filter-label">FROM</label>
              <input type="date" className="date-input" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="d-flex flex-column px-3">
              <label className="filter-label">TO</label>
              <input type="date" className="date-input" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <button className={`refresh-btn ${loading ? 'loading' : ''}`} onClick={loadReport} disabled={loading}>
              {loading ? 'Processing...' : 'Apply Filter'}
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="row g-4 mb-5">
          {[
            { label: "Total Sourcing", val: `৳${data.summary?.totalPurchase?.toLocaleString() || 0}`, icon: "💰", color: "#4F46E5" },
            { label: "Filtered Orders", val: filteredPurchases.length, icon: "📄", color: "#7C3AED" },
            { label: "Top Supplier", val: data.supplierWise?.[0]?._id || "N/A", icon: "🏢", color: "#10B981" },
            { label: "Avg. Transaction", val: `৳${(data.summary?.totalPurchase / (data.summary?.totalInvoices || 1)).toFixed(0)}`, icon: "📊", color: "#F59E0B" }
          ].map((kpi, idx) => (
            <div className="col-md-3" key={idx}>
              <div className="kpi-card shadow-sm border-0 h-100">
                <div className="kpi-icon-box" style={{ background: `${kpi.color}15`, color: kpi.color }}>{kpi.icon}</div>
                <div>
                  <span className="text-muted small fw-bold text-uppercase">{kpi.label}</span>
                  <h4 className="fw-bold mb-0 mt-1" style={{ color: "#1E293B" }}>{kpi.val}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="row g-4 mb-5">
          <div className="col-lg-8 ">
            <div className="white-chart-card shadow-sm h-100 bg-white">
              <h6 className="fw-bold text-muted mb-4 text-uppercase">Monthly Purchase Volume</h6>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.monthly?.map(m => ({ name: formatMonth(m._id.month), total: m.total })) || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="total" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="white-chart-card shadow-sm h-100 bg-success-subtle">
              <h6 className="fw-bold text-muted mb-4 text-uppercase">Daily Pulse (Time Based)</h6>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={dailyPulseData}>
                  <defs>
                    <linearGradient id="pulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fill="url(#pulse)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TABLE WITH REFINED PAGINATION */}
        <div className="table-card shadow-sm mb-5 ">
          <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center bg-warning-subtle">
            <h5 className="fw-bold mb-0 text-danger">Purchase History</h5>
            <span className="badge-count">{filteredPurchases.length} Total</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Supplier</th>
                  <th className="py-3 text-end px-4">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? paginatedData.map(p => (
                  <tr key={p._id}>
                    <td className="px-4 fw-bold text-primary">{p.invoiceNo}</td>
                    <td>{new Date(p.purchaseDate).toLocaleDateString('en-GB')}</td>
                    <td className="fw-semibold">{p.supplier}</td>
                    <td className="text-end fw-bold text-dark px-4">৳{p.grandTotal?.toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FINAL PAGINATION UI */}
          <div className="p-3 bg-white border-top d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing Page <b>{currentPage}</b> of <b>{totalPages || 1}</b>
            </div>
            <div className="pagination-btns d-flex gap-2">
              <button 
                className="page-nav-btn" 
                disabled={currentPage === 1}
                onClick={() => {
                   setCurrentPage(prev => prev - 1);
                   window.scrollTo({ top: 600, behavior: 'smooth' });
                }}
              >
                ← Previous
              </button>
              <button 
                className="page-nav-btn" 
                disabled={currentPage >= totalPages || totalPages === 0}
                onClick={() => {
                   setCurrentPage(prev => prev + 1);
                   window.scrollTo({ top: 600, behavior: 'smooth' });
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .report-container { background-color: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .header-card { background: white; border-radius: 20px; border: 1px solid #E2E8F0; }
        .filter-panel { background: white; border-radius: 12px; border: 1px solid #E2E8F0; padding: 10px; }
        .filter-label { font-size: 10px; font-weight: 800; color: #64748B; margin-bottom: 2px; }
        .date-input { border: none; font-weight: 600; color: #1E293B; outline: none; font-size: 14px; background: transparent; }
        .refresh-btn { background: #4F46E5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; transition: 0.3s; }
        .refresh-btn:hover:not(:disabled) { background: #4338CA; transform: translateY(-1px); }
        .refresh-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .kpi-card { background: white; padding: 25px; border-radius: 16px; display: flex; align-items: center; gap: 15px; border: 1px solid #E2E8F0 !important; }
        .kpi-icon-box { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .white-chart-card { background: white; padding: 25px; border-radius: 20px; border: 1px solid #E2E8F0; }
        .table-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; }
        .badge-count { background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }
        .page-nav-btn { background: white; border: 1px solid #E2E8F0; color: #475569; padding: 7px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; transition: 0.2s; }
        .page-nav-btn:hover:not(:disabled) { background: #F8FAFC; border-color: #CBD5E1; color: #1E293B; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .page-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .table thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B; }
      `}</style>
    </div>
  );
};

export default PurchaseReport;