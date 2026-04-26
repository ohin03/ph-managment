import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip
} from "recharts";
import { 
  FaFileInvoiceDollar, FaHandHoldingUsd, FaExclamationCircle, 
  FaSearch, FaSync, FaCalendarAlt 
} from "react-icons/fa";

const SalesReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [data, setData] = useState({});
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchDashboardData = useCallback(async (pg = 1, keyword = search) => {
    setLoading(true);
    try {
      const [reportRes, listRes] = await Promise.all([
        api.get("/reports/sales-report", { params: { from, to } }),
        api.get("/reports/sales-list", { params: { page: pg, from, to, search: keyword } })
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

  const formatMonth = (m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#F4F7FE", minHeight: "100vh", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 p-3 bg-white shadow-sm rounded-4 border-0">
        <div>
          <h4 className="fw-bold mb-0 text-dark" style={{letterSpacing: '-0.5px'}}>Sales Report</h4>
          <span className="text-muted small">Daily Revenue & Transaction Overview</span>
        </div>

        <div className="d-flex align-items-center gap-2 bg-light p-1 rounded-3">
          <div className="d-flex align-items-center px-2">
            <FaCalendarAlt className="text-muted me-2 small" />
            <input type="date" className="form-control form-control-sm border-0 bg-transparent fw-bold" value={from} onChange={e => setFrom(e.target.value)} />
            <span className="mx-2 text-muted opacity-50">/</span>
            <input type="date" className="form-control form-control-sm border-0 bg-transparent fw-bold" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm rounded-3 px-3 py-2 border-0 shadow-sm" style={{backgroundColor: '#4318FF'}} onClick={() => fetchDashboardData(1)}>
            <FaSync className={loading ? "fa-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- STATS --- */}
      <div className="row g-4 mb-4">
        {[
          { title: "Revenue", val: data.summary?.totalSales, color: "#4318FF", icon: <FaFileInvoiceDollar /> },
          { title: "Paid", val: data.summary?.totalPaid, color: "#05CD99", icon: <FaHandHoldingUsd /> },
          { title: "Due", val: data.summary?.totalDue, color: "#EE5D50", icon: <FaExclamationCircle /> }
        ].map((item, idx) => (
          <div className="col-md-4" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px', backgroundColor: '#F4F7FE', color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-muted fw-bold small text-uppercase mb-0" style={{fontSize: '10px'}}>{item.title}</p>
                  <h3 className="fw-bold text-dark mb-0">৳{item.val?.toLocaleString() || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-4 text-uppercase small">Monthly Analytics</h6>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.monthlySales?.map(i => ({ month: formatMonth(i._id.month), total: i.total }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#F4F7FE', radius: 10 }} />
                <Bar dataKey="total" fill="#4318FF" radius={[8, 8, 8, 8]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-4 text-uppercase small">Top Medicines</h6>
            <div className="d-flex flex-column gap-4">
              {data.topMedicines?.slice(0, 5).map((m, i) => {
                const colors = ['#4318FF', '#39B7FF', '#05CD99', '#FFB547', '#EE5D50'];
                return (
                  <div key={i}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-bold text-dark">{m.medicine}</span>
                      <span className="small text-muted">{m.totalQuantity} Sold</span>
                    </div>
                    <div className="progress" style={{ height: '6px', borderRadius: '20px', backgroundColor: '#F4F7FE' }}>
                      <div className="progress-bar" style={{ width: `${(m.totalQuantity / (data.topMedicines[0].totalQuantity * 1.1)) * 100}%`, backgroundColor: colors[i % 5], borderRadius: '20px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLE WITH CLEAN TIME --- */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="p-4 d-flex justify-content-between align-items-center border-bottom border-light">
          <h6 className="fw-bold mb-0 text-dark">Transaction Log</h6>
          <div className="position-relative" style={{maxWidth: '250px'}}>
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{fontSize: '11px'}} />
            <input className="form-control form-control-sm ps-5 bg-light border-0 shadow-none py-2" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light bg-opacity-50">
              <tr className="text-muted small text-uppercase" style={{fontSize: '10px', letterSpacing: '0.5px'}}>
                <th className="ps-4 border-0 py-3">Invoice</th>
                <th className="border-0 py-3">Date & Time</th>
                <th className="border-0 py-3">Customer</th>
                <th className="border-0 py-3">Paid</th>
                <th className="border-0 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s._id} className="border-bottom-0">
                  <td className="ps-4 fw-bold text-dark py-3">{s.invoiceNo}</td>
                  <td className="py-3">
                    <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                      {new Date(s.saleDate).toLocaleDateString("en-GB")}
                    </div>
                    {/* Time without icon - Minimalist Style */}
                    <div className="text-muted" style={{ fontSize: '11px', marginTop: '1px' }}>
                      {new Date(s.saleDate).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </td>
                  <td className="small fw-semibold py-3 text-secondary">{s.customerId?.name || "Walk-in Guest"}</td>
                  <td className="fw-bold text-dark py-3">৳{s.totalPaid.toLocaleString()}</td>
                  <td className="text-center py-3">
                    <span className={`badge rounded-3 px-3 py-2 ${s.totalDue > 0 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`} style={{fontSize: '10px', fontWeight: '800'}}>
                      {s.totalDue > 0 ? 'DUE' : 'PAID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 d-flex justify-content-between align-items-center bg-white border-top">
          <span className="text-muted small">Page {page} / {totalPages}</span>
          <div className="btn-group gap-2">
            <button className="btn btn-primary btn-sm border rounded-2 px-3" disabled={page === 1} onClick={() => fetchDashboardData(page - 1)}>Prev</button>
            <button className="btn btn-primary btn-sm border rounded-2 px-3" disabled={page === totalPages} onClick={() => fetchDashboardData(page + 1)}>Next</button>
          </div>
        </div>
      </div>

      <style>{`
        .bg-success-subtle { background-color: #E6FFF5 !important; color: #00A389 !important; }
        .bg-danger-subtle { background-color: #FFF5F5 !important; color: #E53E3E !important; }
        .table tbody tr:hover { background-color: #F9FAFB !important; }
      `}</style>
    </div>
  );
};

export default SalesReport;