import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, AreaChart, Area
} from "recharts";
import { FaSync, FaCalendarAlt, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const VendorSalesReport = () => {
  const [sales, setSales] = useState([]);
  const [from, setFrom] = useState(new Date().toISOString().split("T")[0]);
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/vendor-sales");
      setSales(res.data || []);
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ ১২ ঘণ্টা (1 PM, 2 PM) ফরম্যাট লজিক
  const format12hSimple = (hour) => {
    const h = parseInt(hour);
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  const filteredData = useMemo(() => {
    return sales.filter(item => {
      const itemDate = new Date(item.createdAt || item.saleDate).toISOString().split("T")[0];
      const matchesDate = itemDate >= from && itemDate <= to;
      const name = item.vendorId?.name?.toLowerCase() || "";
      const inv = item.invoiceNo?.toLowerCase() || "";
      return matchesDate && (name.includes(search.toLowerCase()) || inv.includes(search.toLowerCase()));
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sales, from, to, search]);

  const stats = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      acc.total += curr.amount || 0;
      acc.paid += curr.paidAmount || 0;
      acc.due += curr.dueAmount || 0;
      return acc;
    }, { total: 0, paid: 0, due: 0 });
  }, [filteredData]);

  // ✅ Today's Pulse with "1 PM" style labels
  const pulseData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ 
      time: format12hSimple(i), 
      amount: 0, 
      rawHr: i 
    }));
    const today = new Date().toLocaleDateString();
    filteredData.forEach(sale => {
      const d = new Date(sale.createdAt || sale.saleDate);
      if(d.toLocaleDateString() === today) hours[d.getHours()].amount += sale.amount;
    });
    return hours.filter(h => h.amount > 0 || (h.rawHr >= 9 && h.rawHr <= 20));
  }, [filteredData]);

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = months.map(m => ({ name: m, total: 0 }));
    sales.forEach(sale => {
      const d = new Date(sale.createdAt || sale.saleDate);
      data[d.getMonth()].total += sale.amount;
    });
    return data;
  }, [sales]);

  const currentTableData = filteredData.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredData.length / limit);

  return (
    <div className="container-fluid py-4 min-vh-100" style={{ backgroundColor: "#F8F9FD", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* --- PREMIUM TOP BAR --- */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-800 text-dark mb-1" style={{ letterSpacing: "-1.5px" }}>Vendor Pulse</h2>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3">Analytics Mode</span>
            <span className="text-muted small fw-medium">Real-time supply data</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center bg-white rounded-pill shadow-sm px-4 py-2 border">
            <FaCalendarAlt className="text-primary me-2" size={12} />
            <input type="date" className="form-control form-control-sm border-0 bg-transparent p-0 fw-bold small" value={from} onChange={e => setFrom(e.target.value)} />
            <span className="mx-2 text-muted opacity-50">—</span>
            <input type="date" className="form-control form-control-sm border-0 bg-transparent p-0 fw-bold small" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="btn btn-white shadow-sm rounded-circle p-2 border" onClick={loadData}>
            <FaSync className={loading ? "fa-spin" : ""} color="#4318FF" />
          </button>
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="row g-4 mb-4">
        {[
          { label: "Purchase", val: stats.total, color: "#4318FF", bg: "white" },
          { label: "Paid", val: stats.paid, color: "#05CD99", bg: "white" },
          { label: "Accounts Payable", val: stats.due, color: "#EE5D50", bg: "white" }
        ].map((item, i) => (
          <div className="col-md-4" key={i}>
            <div className="card border-0 shadow-sm rounded-5 p-4 overflow-hidden position-relative" style={{ backgroundColor: item.bg }}>
              <div className="position-relative z-1">
                <p className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: "11px", letterSpacing: "1px" }}>{item.label}</p>
                <h2 className="fw-900 mb-0" style={{ color: "#2B3674" }}>৳{item.val.toLocaleString()}</h2>
              </div>
              <div className="position-absolute end-0 bottom-0 p-3 opacity-10">
                 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: item.color }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- GRAPHS SECTION --- */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-info-subtle">
            <p className="fw-bold text-dark mb-4 ms-2">Monthly Flow</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F4F7FE" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 11, fontWeight: '700'}} />
                <Tooltip cursor={{fill: '#F4F7FE', radius: 10}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}} />
                <Bar dataKey="total" fill="#4318FF" radius={[10, 10, 10, 10]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-5 p-4 bg-success-subtle">
            <p className="fw-bold text-dark mb-4 ms-2">Daily Pulse (12h format)</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={pulseData}>
                <defs>
                  <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4318FF" stopOpacity={0.2}/><stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 10, fontWeight: '700'}} />
                <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}} />
                <Area type="monotone" dataKey="amount" stroke="#4318FF" strokeWidth={4} fill="url(#colorPulse)" dot={{ r: 4, fill: '#4318FF', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- CLEAN LOG TABLE --- */}
      <div className="card border-0 shadow-sm rounded-5 bg-white overflow-hidden">
        <div className="px-4 py-4 d-flex justify-content-between align-items-center flex-wrap gap-3 bg-dark-subtle">
          <h5 className="fw-800 mb-0" style={{ color: "#2B3674" }}>Purchase Activity</h5>
          <div className="position-relative">
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted opacity-50" size={13} />
            <input className="form-control ps-5 rounded-pill border-0 bg-light py-2 small fw-medium" style={{ width: "260px" }} placeholder="Search vendor..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="bg-light bg-opacity-30">
                <th className="ps-4 py-3 border-0 text-muted small fw-bold">VENDOR</th>
                <th className="py-3 border-0 text-muted small fw-bold">INVOICE</th>
                <th className="py-3 border-0 text-muted small fw-bold">TOTAL</th>
                <th className="py-3 border-0 text-muted small fw-bold">STATUS</th>
                <th className="text-end pe-4 py-3 border-0 text-muted small fw-bold">TIME</th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.map(s => (
                <tr key={s._id} className="border-bottom-0">
                  <td className="ps-4 py-3">
                    <div className="fw-bold text-dark mb-0">{s.vendorId?.name || "N/A"}</div>
                    <div className="text-muted x-small fw-bold">{s.vendorId?.company || "Personal"}</div>
                  </td>
                  <td><span className="badge bg-light text-primary fw-800 rounded-pill px-3">#{s.invoiceNo}</span></td>
                  <td>
                    <div className="fw-900" style={{ color: "#2B3674" }}>৳{s.amount.toLocaleString()}</div>
                    {s.dueAmount > 0 && <div className="text-danger fw-bold x-small">Due: ৳{s.dueAmount}</div>}
                  </td>
                  <td>
                    <div className={`d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-bold ${s.dueAmount === 0 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{fontSize: '10px'}}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                      {s.dueAmount === 0 ? 'PAID' : 'DUE'}
                    </div>
                  </td>
                  <td className="text-end pe-4">
                    <div className="fw-bold text-dark small">{new Date(s.createdAt || s.saleDate).toLocaleDateString("en-GB")}</div>
                    <div className="text-muted fw-medium" style={{fontSize: '10px'}}>{new Date(s.createdAt || s.saleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-4 d-flex justify-content-between align-items-center bg-white border-top border-light">
           <button className="btn btn-light rounded-pill px-4 fw-bold text-muted border-0 shadow-none" disabled={page === 1} onClick={() => setPage(page - 1)}><FaChevronLeft className="me-2" size={10}/> Prev</button>
           <div className="text-muted fw-900 x-small">PAGE {page} OF {totalPages || 1}</div>
           <button className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>Next <FaChevronRight className="ms-2" size={10}/></button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .fw-800 { font-weight: 800; }
        .fw-900 { font-weight: 900; }
        .x-small { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .bg-primary-subtle { background-color: #E9EDFF !important; }
        .bg-success-subtle { background-color: #D1F7E8 !important; color: #008767 !important; }
        .bg-warning-subtle { background-color: #FFF4E5 !important; color: #FF9900 !important; }
        .table tbody tr { transition: 0.2s; cursor: pointer; }
        .table tbody tr:hover { background-color: #F8F9FD !important; transform: scale(1.002); }
        .card { transition: transform 0.3s ease; }
        .card:hover { transform: translateY(-5px); }
      `}</style>
    </div>
  );
};

export default VendorSalesReport;