import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, AreaChart, Area
} from "recharts";
import { 
  FaFileInvoiceDollar, FaHandHoldingUsd, FaExclamationCircle, 
  FaSearch, FaSync, FaCalendarAlt, FaChartLine 
} from "react-icons/fa";

const SalesReport = () => {
  const todayDate = new Date().toISOString().split("T")[0];
  const [data, setData] = useState({ summary: {}, monthlySales: [], topMedicines: [] });
  const [sales, setSales] = useState([]);
  const [from, setFrom] = useState(todayDate);
  const [to, setTo] = useState(todayDate);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchDashboardData = useCallback(async (pg = 1, keyword = search) => {
    setLoading(true);
    try {
      const params = { from, to, page: pg, search: keyword };
      const [reportRes, listRes] = await Promise.all([
        api.get("/reports/sales-report", { params: { from, to } }),
        api.get("/reports/sales-list", { params })
      ]);
      setData(reportRes.data || {});
      setSales(listRes.data.data || []);
      setTotalPages(listRes.data.totalPages || 1);
      setPage(listRes.data.currentPage || 1);
    } catch (err) { 
      console.error("API Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [from, to, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDashboardData(1), 500);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  // ✅ ১২ ঘণ্টা ফরম্যাট (AM/PM) লজিক
  const format12h = (hour) => {
    const h = parseInt(hour);
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  // ✅ Today's Sales Pulse (Hourly Graph)
  const pulseData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ 
      time: format12h(i), 
      rawHour: i,
      amount: 0 
    }));

    // এপিআই থেকে আসা সেলস লিস্ট থেকে আজকের ডাটা আলাদা করা
    const todayStr = new Date().toLocaleDateString();
    sales.forEach(sale => {
      const saleDate = new Date(sale.saleDate);
      if (saleDate.toLocaleDateString() === todayStr) {
        const hr = saleDate.getHours();
        if(hours[hr]) hours[hr].amount += sale.totalAmount;
      }
    });

    // শুধুমাত্র কাজের সময় (সকাল ৮ - রাত ১১) দেখানোর জন্য ফিল্টার
    return hours.filter(h => h.amount > 0 || (h.rawHour >= 8 && h.rawHour <= 22));
  }, [sales]);

  const formatMonth = (m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];

  return (
    <div className="container-fluid py-4 min-vh-100" style={{ backgroundColor: "#F8F9FE", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 💎 PREMIUM HEADER */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-success">
        <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary"><FaChartLine /></div>
              <h4 className="fw-900 text-dark mb-0 tracking-tight">SALES <span className="text-white">HISTORY</span></h4>
            </div>
            <p className="text-muted small fw-medium mb-0 ms-1">Real-time revenue & transaction metrics</p>
          </div>

          <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 shadow-sm border">
            <FaCalendarAlt className="text-primary" />
            <input type="date" className="form-control form-control-sm border-0 bg-transparent fw-bold" value={from} onChange={e => setFrom(e.target.value)} />
            <span className="text-muted fw-black">/</span>
            <input type="date" className="form-control form-control-sm border-0 bg-transparent fw-bold" value={to} onChange={e => setTo(e.target.value)} />
            <button className={`btn btn-primary btn-sm rounded-circle p-2 ms-2 shadow ${loading ? 'disabled' : ''}`} onClick={() => fetchDashboardData(1)}>
              <FaSync className={loading ? "fa-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 KPI STATS */}
      <div className="row g-4 mb-4">
        {[
          { title: "Total Revenue", val: data.summary?.totalSales, color: "#4318FF", icon: <FaFileInvoiceDollar />, sub: "Gross sales value" },
          { title: "Paid Amount", val: data.summary?.totalPaid, color: "#05CD99", icon: <FaHandHoldingUsd />, sub: "Cash in hand" },
          { title: "Total Due", val: data.summary?.totalDue, color: "#EE5D50", icon: <FaExclamationCircle />, sub: "Receivable credit" }
        ].map((item, idx) => (
          <div className="col-md-4" key={idx}>
            <div className="card border-0 shadow-sm rounded-5 p-4 bg-white position-relative overflow-hidden h-100 card-hover">
              <div className="d-flex align-items-center gap-4">
                <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '64px', height: '64px', backgroundColor: `${item.color}15`, color: item.color, fontSize: '24px' }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-muted fw-black small text-uppercase mb-1" style={{fontSize: '11px', letterSpacing: '0.5px'}}>{item.title}</p>
                  <h2 className="fw-900 text-dark mb-0">৳{item.val?.toLocaleString() || 0}</h2>
                  <span className="x-small text-muted fw-bold">{item.sub}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 ANALYTICS SECTION */}
      <div className="row g-4 mb-4">
        {/* Monthly Trend */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-5 p-4  h-100 bg-dark-subtle">
            <h6 className="fw-900 text-dark mb-4 text-uppercase small d-flex align-items-center">
              <span className="p-1 bg-primary rounded-circle me-2"></span> Monthly Growth Trend
            </h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlySales?.map(i => ({ month: formatMonth(i._id.month), total: i.total }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#F8FAFC', radius: 10 }} contentStyle={{ borderRadius: "15px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="total" fill="#4318FF" radius={[10, 10, 4, 4]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Sales Pulse (12h format) */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-white h-100 bg-info-subtle">
            <h6 className="fw-900 text-dark mb-4 text-uppercase small d-flex align-items-center">
              <span className="p-1 bg-success rounded-circle me-2 "></span> Today's Pulse (AM/PM)
            </h6>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={pulseData}>
                <defs>
                  <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#05CD99" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#05CD99" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ borderRadius: "15px", border: "none" }} />
                <Area type="monotone" dataKey="amount" stroke="#05CD99" strokeWidth={3} fillOpacity={1} fill="url(#pulseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 📋 TOP MEDICINES & TRANSACTIONS */}
      <div className="row g-4">
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-white h-100 bg-warning-subtle">
            <h6 className="fw-900 text-danger mb-4 text-uppercase small">Most Valuable Products</h6>
            <div className="d-flex flex-column gap-4">
              {data.topMedicines?.slice(0, 6).map((m, i) => {
                const colors = ['#4318FF', '#39B7FF', '#05CD99', '#FFB547', '#EE5D50', '#818CF8'];
                const maxVal = data.topMedicines[0]?.totalQuantity || 1;
                return (
                  <div key={i}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-black text-dark">{m.medicine}</span>
                      <span className="badge bg-light text-dark fw-900">{m.totalQuantity} Sold</span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '10px', backgroundColor: '#F4F7FE' }}>
                      <div className="progress-bar shadow-none" style={{ width: `${(m.totalQuantity / maxVal) * 100}%`, backgroundColor: colors[i % 6], borderRadius: '10px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card border-0 shadow-sm rounded-5 bg-white h-100 overflow-hidden">
            <div className="p-4 d-flex justify-content-between align-items-center border-bottom border-light flex-wrap gap-3">
              <h6 className="fw-900 mb-0 text-primary">Recent Transactions</h6>
              <div className="position-relative" style={{ minWidth: '250px' }}>
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '12px' }} />
                <input className="form-control form-control-sm ps-5 bg-light border-0 shadow-none py-2 rounded-pill" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="bg-light bg-opacity-50 text-muted x-small fw-black text-uppercase">
                    <th className="ps-4 py-3 border-0">Invoice Info</th>
                    <th className="py-3 border-0">Customer</th>
                    <th className="py-3 border-0">Total Amount</th>
                    <th className="py-3 border-0 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s._id} className="border-bottom-0">
                      <td className="ps-4 py-3">
                        <div className="fw-900 text-dark">#{s.invoiceNo}</div>
                        <div className="x-small text-muted fw-bold">
                          {new Date(s.saleDate).toLocaleDateString("en-GB")} • {new Date(s.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="fw-bold text-secondary small">{s.customerId?.name || "Walking Guest"}</div>
                        <div className="x-small text-muted">{s.customerId?.phone || "Private Contact"}</div>
                      </td>
                      <td className="py-3">
                        <div className="fw-900 text-dark">৳{s.totalPaid.toLocaleString()}</div>
                        {s.totalDue > 0 && <div className="x-small text-danger fw-bold">Due: ৳{s.totalDue}</div>}
                      </td>
                      <td className="text-center py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${s.totalDue > 0 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`} style={{fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px'}}>
                          {s.totalDue > 0 ? 'PARTIAL' : 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

       {/* ✅ UPDATED PAGINATION SECTION */}
<div className="p-4 d-flex justify-content-between align-items-center border-top bg-light bg-opacity-25">
  {/* Left Side: Records Info */}
  <div className="text-muted small fw-bold">
    Showing <span className="text-dark">{(page - 1) * 10 + 1}</span> to <span className="text-dark">{Math.min(page * 10, sales.length * totalPages)}</span> of <span className="text-dark">{sales.length * totalPages}</span> results
  </div>

  {/* Center/Right Side: Modern Page Navigator */}
  <div className="d-flex align-items-center gap-3">
    <button 
      className="btn btn-sm btn-white border rounded-pill px-3 fw-black x-small shadow-sm" 
      disabled={page === 1} 
      onClick={() => fetchDashboardData(page - 1)}
      style={{ transition: '0.2s' }}
    >
      PREV
    </button>

    <div className="px-3 py-1 bg-white border rounded-pill shadow-sm">
      <span className="x-small fw-black text-muted">Page </span>
      <span className="fw-900 text-primary small">{page}</span>
      <span className="x-small fw-black text-muted"> of </span>
      <span className="fw-900 text-dark small">{totalPages}</span>
    </div>

    <button 
      className="btn btn-sm btn-primary rounded-pill px-3 fw-black x-small shadow-sm" 
      disabled={page === totalPages} 
      onClick={() => fetchDashboardData(page + 1)}
      style={{ transition: '0.2s' }}
    >
      NEXT
    </button>
  </div>
</div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
        .fw-900 { font-weight: 900; }
        .fw-black { font-weight: 800; }
        .x-small { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
        .bg-success-subtle { background-color: #E6FFF5 !important; color: #00A389 !important; }
        .bg-danger-subtle { background-color: #FFF5F5 !important; color: #E53E3E !important; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.06) !important; }
        .tracking-tight { letter-spacing: -1.2px; }
        .table tbody tr:hover { background-color: #F8FAFC !important; }
      `}</style>
    </div>
  );
};

export default SalesReport;