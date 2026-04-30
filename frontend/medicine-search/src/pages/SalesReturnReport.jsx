import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
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
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";

const COLORS = ["#F43F5E", "#FB923C", "#818CF8", "#34D399", "#EC4899"];

const SalesReturnReport = () => {
  const [data, setData] = useState({ summary: {}, topReturnedMedicines: [], monthlyReturns: [] });
  const [allReturns, setAllReturns] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 7;

  const loadFullReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const [analyticsRes, listRes] = await Promise.all([
        api.get("/reports/sales-return-report", { params }),
        api.get("/sales-return")
      ]);
      
      setData(analyticsRes.data || {});
      setAllReturns(listRes.data || []);
      
      if (from || to) toast.info("Data synced for selected range");
    } catch (err) {
      toast.error("Failed to sync intelligence data");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadFullReport();
  }, [loadFullReport]);

  const format12h = (hour) => {
    const h = parseInt(hour);
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  // ✅ আজকের পালস গ্রাফ ডাটা
  const todayData = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const filtered = allReturns.filter(item => 
      new Date(item.createdAt).toLocaleDateString() === today
    );
    const hours = Array.from({ length: 24 }, (_, i) => ({ 
      hour: format12h(i), 
      rawHour: i,
      amount: 0 
    }));
    filtered.forEach(item => {
      const hr = new Date(item.createdAt).getHours();
      if(hours[hr]) hours[hr].amount += item.totalAmount;
    });
    return hours.filter(h => h.amount > 0 || (h.rawHour >= 9 && h.rawHour <= 21));
  }, [allReturns]);

  // ✅ মান্থলি ট্রেন্ড গ্রাফ ডাটা
  const monthlyTrendData = useMemo(() => {
    if (!data?.monthlyReturns) return [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return data.monthlyReturns.map(item => ({
      name: months[item._id?.month - 1] || `M-${item._id?.month}`,
      amount: item.total || 0
    }));
  }, [data]);

  // ✅ ডেট ফিল্টার লজিক
  const filteredReturns = useMemo(() => {
    let result = [...allReturns];
    if (from || to) {
      const startDate = from ? new Date(from) : null;
      const endDate = to ? new Date(to) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      result = result.filter((item) => {
        const itemDate = new Date(item.createdAt);
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allReturns, from, to]);

  const totalPages = Math.ceil(filteredReturns.length / limit);
  const currentTableData = filteredReturns.slice((page - 1) * limit, page * limit);

  return (
    <div className="container-fluid py-4 min-vh-100" style={{ backgroundColor: "#F4F7FE", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 🏆 MODERN GLASS HEADER */}
      <div className="card border-0 shadow-sm rounded-5 mb-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #fff 0%, #fdfdfd 100%)" }}>
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-danger shadow-lg rounded-pill d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>
                   <span className="fs-3 text-white">📉</span>
                </div>
                <div>
                  <h2 className="fw-900 mb-0 text-dark tracking-tighter">RETURN <span className="text-danger">INSIGHTS</span></h2>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-soft-danger text-danger border-0 small px-2">PRO VERSION</span>
                    <span className="text-muted x-small fw-bold">{new Date().toDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7 mt-3 mt-lg-0">
               <div className="d-flex flex-wrap justify-content-lg-end gap-3">
                  <div className="filter-box d-flex align-items-center bg-white border rounded-pill px-4 shadow-sm">
                    <input type="date" className="form-control border-0 bg-transparent small fw-bold py-2" value={from} onChange={e => setFrom(e.target.value)} />
                    <div className="vr mx-3 my-2" style={{ height: "20px" }}></div>
                    <input type="date" className="form-control border-0 bg-transparent small fw-bold py-2" value={to} onChange={e => setTo(e.target.value)} />
                  </div>
                  <button className="btn btn-dark rounded-pill px-5 fw-900 shadow-sm transition-all" onClick={() => { setPage(1); loadFullReport(); }}>
                    {loading ? "SYNCING..." : "REFRESH"}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 KPI DASHBOARD CARDS */}
      <div className="row g-4 mb-4">
        {[
          { label: "Net Loss Value", val: data.summary?.totalReturnAmount?.toLocaleString() || "0", color: "#F43F5E", icon: "💰", sub: "Total refunded cash" },
          { label: "Return Avg.", val: (data.summary?.totalReturnAmount / (filteredReturns.length || 1)).toFixed(0) || "0", color: "#6366F1", icon: "⚖️", sub: "Avg per transaction" },
          { label: "Total Cases", val: filteredReturns.length, color: "#F59E0B", icon: "📂", sub: "Active filtered results" },
          { label: "Item Recovery", val: data.summary?.totalItemsReturned || "0", color: "#10B981", icon: "📦", sub: "Units back in stock" }
        ].map((item, i) => (
          <div className="col-md-3" key={i}>
            <div className="card border-0 shadow-sm rounded-5 p-4 bg-white h-100 card-hover">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="p-3 rounded-4 bg-opacity-10" style={{backgroundColor: item.color}}>
                   <span className="fs-4">{item.icon}</span>
                </div>
                <span className="text-muted x-small fw-black">LIVE</span>
              </div>
              <h6 className="text-muted small fw-bold text-uppercase mb-1">{item.label}</h6>
              <h3 className="fw-900 mb-1" style={{ color: item.color }}>৳ {item.val}</h3>
              <p className="text-muted x-small mb-0">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 ANALYTICS GRAPHS */}
      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-primary-subtle h-100">
            <h5 className="fw-900 mb-4 d-flex align-items-center">
              <span className="badge bg-danger me-2" style={{width: '12px', height: '12px', borderRadius: '50%'}}> </span>
              Monthly Performance Trend
            </h5>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold', fontSize: 12}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="amount" fill="#F43F5E" radius={[15, 15, 5, 5]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-success-subtle h-100">
            <h5 className="fw-900 mb-4 d-flex align-items-center">
              <span className="badge bg-primary me-2" style={{width: '12px', height: '12px', borderRadius: '50%'}}> </span>
              Today's Pulse (12h Format)
            </h5>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={todayData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 📋 TRANSACTIONS & STOCK LOSS PIE */}
      <div className="row g-4">
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-dark-subtle h-100">
            <h5 className="fw-900 mb-4 text-center text-danger">Product Loss Share</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.topReturnedMedicines?.map(m => ({ name: m._id, value: m.totalQuantity })) || []} dataKey="value" innerRadius={85} outerRadius={110} paddingAngle={8}>
                  {data.topReturnedMedicines?.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={12} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card border-0 shadow-sm rounded-5 bg-white h-100 overflow-hidden">
            <div className="p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-900 mb-0 text-danger">Detailed Reversal Logs</h5>
              <div className="bg-light px-3 py-1 rounded-pill x-small fw-black text-muted border">
                SHOWING {currentTableData.length} OF {filteredReturns.length}
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="bg-light text-muted x-small fw-black">
                    <th className="ps-4 py-3">INVOICE & REF</th>
                    <th>CUSTOMER DETAILS</th>
                    <th>TOTAL REFUND</th>
                    <th>TIME STAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTableData.map((ret) => (
                    <tr key={ret._id} className="border-bottom-0">
                      <td className="ps-4 py-4">
                        <div className="fw-900 text-primary">#{ret.returnInvoiceNo}</div>
                        <div className="x-small text-muted fw-bold">Ref: #{ret.originalSaleId?.invoiceNo || 'N/A'}</div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{ret.customerId?.name || "Walking Customer"}</div>
                        <div className="x-small text-muted">{ret.customerId?.phone || "No Contact"}</div>
                      </td>
                      <td>
                        <span className="fw-900 text-danger" style={{fontSize: '1.1rem'}}>৳ {ret.totalAmount?.toLocaleString()}</span>
                      </td>
                      <td>
                        <div className="small fw-black text-dark">{new Date(ret.createdAt).toLocaleDateString('en-GB')}</div>
                        <div className="x-small text-muted fw-bold">{new Date(ret.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</div>
                      </td>
                    </tr>
                  ))}
                  {currentTableData.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-5 fw-bold text-muted">No records found for selected period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 d-flex justify-content-between align-items-center border-top">
               <button className="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-bold" disabled={page === 1} onClick={() => setPage(page - 1)}>PREV</button>
               <div className="d-flex gap-1">
                 {[...Array(totalPages)].map((_, i) => (
                   <button key={i} className={`btn btn-sm rounded-circle ${page === i+1 ? 'btn-dark' : 'btn-light'}`} style={{width: '30px', height: '30px', fontSize: '10px'}} onClick={() => setPage(i+1)}>{i+1}</button>
                 ))}
               </div>
               <button className="btn btn-sm btn-danger rounded-pill px-4 fw-bold" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>NEXT</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
        .fw-900 { font-weight: 900; }
        .x-small { font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase; }
        .bg-soft-danger { background-color: #fee2e2; }
        .tracking-tighter { letter-spacing: -1.5px; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
        .transition-all { transition: all 0.3s ease; }
        .btn-dark:hover { transform: scale(1.05); }
      `}</style>
    </div>
  );
};

export default SalesReturnReport;