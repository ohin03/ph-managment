import React, { useEffect, useState } from "react";
import axios from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#2563EB", "#10B981", "#F59E0B"];

const VendorReceiveReport = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentStats, setPaymentStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", paymentMethod: "" });

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/reports/vendor-receive-report", { params: filters });
      const report = res.data.data;
      setData(report);
      setTotal(res.data.totalAmount);
      setCurrentPage(1); // Reset to first page on new filter

      const stats = [
        { name: "Cash", value: report.filter(i => i.paymentMethod === "CASH").reduce((a, b) => a + b.amount, 0) },
        { name: "Bank", value: report.filter(i => i.paymentMethod === "BANK").reduce((a, b) => a + b.amount, 0) },
        { name: "Mobile", value: report.filter(i => i.paymentMethod === "MOBILE_BANKING").reduce((a, b) => a + b.amount, 0) }
      ];
      setPaymentStats(stats);

      const grouped = {};
      report.forEach((item) => {
        const date = new Date(item.transactionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        grouped[date] = (grouped[date] || 0) + item.amount;
      });
      setDailyStats(Object.keys(grouped).map(d => ({ date: d, amount: grouped[d] })));
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, []);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTableData = data.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      
      {/* 📋 SIMPLE BREADCRUMB & TITLE */}
      <div className="mb-4">
        <h4 className="fw-bold text-danger mb-1">Vendor Payment Report</h4>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item small text-muted">Reports</li>
            <li className="breadcrumb-item small text-primary active">Vendor Receive</li>
          </ol>
        </nav>
      </div>

      {/* 🔍 COMPACT FILTER BAR */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-dark-subtle">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <input type="date" name="startDate" className="form-control form-control-sm border-light bg-light" onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
            </div>
            <div className="col-md-3">
              <input type="date" name="endDate" className="form-control form-control-sm border-light bg-light" onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
            </div>
            <div className="col-md-3">
              <select name="paymentMethod" className="form-select form-select-sm border-light bg-light" onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}>
                <option value="">All Payment Methods</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
                <option value="MOBILE_BANKING">Mobile Banking</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary btn-sm w-100 fw-bold" onClick={fetchReport}>
                {loading ? "Loading..." : "Filter Results"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 SUMMARY TILES */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4">
            <small className="text-muted fw-bold text-uppercase">Total Disbursed</small>
            <h3 className="fw-bold mb-0">৳{total?.toLocaleString()}</h3>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4">
            <small className="text-muted fw-bold text-uppercase">Total Invoices</small>
            <h3 className="fw-bold mb-0">{data.length}</h3>
          </div>
        </div>
      </div>

      {/* 📈 MAIN CHARTS */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            <h6 className="fw-bold mb-4">Daily Payment Analytics</h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip cursor={{fill: '#F1F5F9'}} />
                <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white text-center bg-info-subtle">
            <h6 className="fw-bold mb-4">Payment Method Mix</h6>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {paymentStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 📄 CLEAN TABLE */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white py-3 border-0">
          <h6 className="fw-bold mb-0 text-success">Transaction Ledger</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="small text-muted text-uppercase fw-bold">
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-end">Amount</th>
                <th className="px-4 py-3 text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.map((item) => (
                <tr key={item._id} className="border-bottom">
                  <td className="px-4 py-3 fw-bold text-primary">{item.receiptNo}</td>
                  <td className="px-4 py-3 fw-bold">{item.vendorId?.name}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-soft-primary text-primary px-3">{item.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3 text-end fw-bold">৳{item.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-muted small">
                    {new Date(item.transactionDate).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
          <small className="fw-bold text-muted">
            Page <span className="text-dark">{currentPage}</span> of <span className="text-dark">{totalPages || 1}</span>
          </small>
          <div className="btn-group">
            <button 
              className="btn btn-sm btn-outline-primary px-3" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <button 
              className="btn btn-sm btn-outline-primary px-3" 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .bg-soft-primary { background-color: #E0E7FF; }
        .breadcrumb-item + .breadcrumb-item::before { content: "•"; color: #CBD5E1; }
        .form-control-sm, .form-select-sm { border-radius: 8px; }
        .table thead th { letter-spacing: 0.5px; }
        .card { transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

export default VendorReceiveReport;