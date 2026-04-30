import React, { useEffect, useState, useMemo } from "react";
import { getCustomerLedger } from "../api/ledgerApi";
import { getCustomers } from "../api/customerApi";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaPrint, FaSync, FaArrowLeft, FaFileInvoice, 
  FaMoneyCheckAlt, FaUserCircle, FaDownload, FaPlus, FaCheckCircle, FaClock,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";

const CustomerLedger = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const selectedCustomer = useMemo(() => 
    customers.find(c => c._id === customerId), 
    [customers, customerId]
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomers();
        setCustomers(res.data || []);
      } catch {
        toast.error("Failed to load customer list");
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchLedger = async () => {
      if (!customerId) return;
      try {
        setLoading(true);
        const data = await getCustomerLedger(customerId);
        setLedger(data.entries || []);
        setBalance(data.currentDue || 0);
        setCurrentPage(1); // নতুন কাস্টমার সিলেক্ট করলে পেজ ১ এ ফিরে যাবে
      } catch {
        toast.error("Error loading ledger details");
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, [customerId]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return customers;
    return customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(term)) || 
      (c.phone && c.phone.includes(term))
    );
  }, [searchTerm, customers]);

  // ফিল্টার করা মেইন লেজার ডাটা
  const filteredLedger = useMemo(() => {
    return ledger.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return (!dateRange.start || entryDate >= dateRange.start) && 
             (!dateRange.end || entryDate <= dateRange.end);
    });
  }, [ledger, dateRange]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredLedger.length / itemsPerPage);
  
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredLedger.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredLedger]);

  const totalDebit = filteredLedger.reduce((s, i) => s + (i.debit || 0), 0);
  const totalCredit = filteredLedger.reduce((s, i) => s + (i.credit || 0), 0);

  return (
    <div className="erp-root">
      <header className="erp-header no-print">
        <div className="header-brand">
          <button className="btn-circle-back" onClick={() => navigate(-1)}>
            <FaArrowLeft size={12} />
          </button>
          <div className="title-group">
            <h6 className="m-0 text-primary-dark">Customer Ledger</h6>
            <span className="subtitle">Accounts Tracking</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-action btn-print" onClick={() => window.print()}>
            <FaPrint size={12} /> <span>Print</span>
          </button>
          <button className="btn-action btn-refresh" onClick={() => window.location.reload()}>
            <FaSync size={12} /> <span>Refresh</span>
          </button>
        </div>
      </header>

      <div className="erp-layout  ">
        <aside className="erp-sidebar no-print">
          <div className="sidebar-search">
            <input 
              type="text" 
              className="modern-input"
              placeholder="Search name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="sidebar-list custom-scroll">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(c => (
                <div 
                  key={c._id} 
                  className={`cust-item ${customerId === c._id ? "active" : ""}`}
                  onClick={() => navigate(`/customer-ledger/${c._id}`)}
                >
                  <div className="cust-info">
                    <span className="cust-name">{c.name}</span>
                    <span className="cust-phone">{c.phone || "No Number"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted small">Not found</div>
            )}
          </div>

          <div className="sidebar-footer">
            <button className="btn-add-new" onClick={() => navigate('/administration/customer-setup')}>
              <FaPlus size={10} /> <span>New Customer</span>
            </button>
          </div>
        </aside>

        <main className="erp-content">
          <div className="print-header ">
             <div className="biz-info">
                <h1>Pharmacy</h1>
                <p>Stay with us :: Happy customer</p>
                <p className="small">Date: {new Date().toLocaleDateString()}</p>
             </div>
             <div className="cust-print-details">
                <h3>Customer Statement</h3>
                <p><strong>Name:</strong> {selectedCustomer?.name || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedCustomer?.phone || 'N/A'}</p>
             </div>
          </div>

          <div className="kpi-container">
            <div className="kpi-card debit-card">
              <div className="kpi-icon-mini text-danger-bg"><FaFileInvoice size={14} /></div>
              <div className="kpi-data">
                <label>Total Billed</label>
                <h5 className="text-danger">৳{totalDebit.toLocaleString()}</h5>
              </div>
            </div>
            <div className="kpi-card credit-card">
              <div className="kpi-icon-mini text-success-bg"><FaMoneyCheckAlt size={14} /></div>
              <div className="kpi-data">
                <label>Total Paid</label>
                <h5 className="text-success">৳{totalCredit.toLocaleString()}</h5>
              </div>
            </div>
            <div className="kpi-card balance-card">
              <div className="kpi-icon-mini text-primary-bg"><FaUserCircle size={14} /></div>
              <div className="kpi-data">
                <label>Total Outstanding</label>
                <h5 className="text-primary-dark">৳{balance.toLocaleString()}</h5>
              </div>
            </div>
          </div>

          <div className="ledger-box">
            <div className="ledger-filter-row no-print">
              <div className="date-group">
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                <span className="sep">TO</span>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
              </div>
              <button className="btn-export-mini">
                <FaDownload size={10} /> <span>Export Report</span>
              </button>
            </div>

            <div className="table-wrapper">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Transaction Date</th>
                    <th>Ref ID & Details</th>
                    <th className="no-print">Status</th>
                    <th className="text-end">Debit (+)</th>
                    <th className="text-end">Credit (-)</th>
                    <th className="text-end pe-3">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="status-cell">Processing...</td></tr>
                  ) : (
                    currentTableData.length > 0 ? (
                        currentTableData.map((entry, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="txt-bold">{new Date(entry.date).toLocaleDateString()}</div>
                            <div className="txt-small no-print">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </td>
                          <td>
                            <div className="txt-bold text-dark">{entry.reference}</div>
                            <div className="txt-muted small">{entry.description}</div>
                          </td>
                          <td className="no-print">
                            {entry.balance === 0 ? (
                              <span className="status-badge cleared"><FaCheckCircle size={10} /> Cleared</span>
                            ) : (
                              <span className="status-badge pending"><FaClock size={10} /> Pending</span>
                            )}
                          </td>
                          <td className="text-end txt-bold text-danger">{entry.debit ? `৳${entry.debit.toLocaleString()}` : "—"}</td>
                          <td className="text-end txt-bold text-success-dark">{entry.credit ? `৳${entry.credit.toLocaleString()}` : "—"}</td>
                          <td className="text-end pe-3">
                            <span className="badge-balance">৳{entry.balance.toLocaleString()}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                        <tr><td colSpan="6" className="text-center p-4 text-muted">No data found</td></tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* --- Pagination UI --- */}
            <div className="pagination-wrapper no-print">
              <span className="page-info">
                Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
              </span>
              <div className="page-buttons">
                <button 
                  className="btn-page" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <FaChevronLeft size={10} /> Prev
                </button>
                <button 
                  className="btn-page" 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next <FaChevronRight size={10} />
                </button>
              </div>
            </div>

            <div className="print-footer">
               <div className="sig-box">
                  <div className="line"></div>
                  <p>Customer Signature</p>
               </div>
               <div className="sig-box">
                  <div className="line"></div>
                  <p>Authorized Signature</p>
               </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .erp-root { background: #f4f7fa; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
        .text-primary-dark { color: #0f172a; font-weight: 800; }
        .text-success-dark { color: #15803d; }

        .erp-header { height: 55px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .header-brand { display: flex; align-items: center; gap: 12px; }
        .btn-circle-back { width: 32px; height: 32px; border: none; background: #f1f5f9; border-radius: 50%; color: #6366f1; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .title-group h6 { font-size: 0.9rem; margin-bottom: 0; }
        .title-group .subtitle { font-size: 0.7rem; color: #64748b; font-weight: 500; }
        
        .header-actions { display: flex; gap: 6px; }
        .btn-action { border: none; padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; transition: 0.3s; cursor: pointer; }
        .btn-print { background: #fff; border: 1px solid #e2e8f0; color: #475569; }
        .btn-refresh { background: #6366f1; color: #fff; }

        .erp-layout { display: flex; height: calc(100vh - 55px); }
        .erp-sidebar { width: 260px; background: #fff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; }
        .sidebar-search { padding: 15px; }
        .modern-input { border: 1px solid #cbd5e1; background: #f8fafc; padding: 8px 12px; border-radius: 10px; width: 100%; font-size: 0.8rem; outline: none; transition: 0.2s; }
        .sidebar-list { flex: 1; overflow-y: auto; padding: 10px; }
        .cust-item { padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; margin-bottom: 5px; border: 1px solid transparent; }
        .cust-item:hover { background: #f1f5f9; }
        .cust-item.active { background: #f0f3ff; border-color: #c7d2fe; }
        .cust-name { display: block; font-size: 0.85rem; font-weight: 700; color: #1e293b; }
        .cust-phone { font-size: 0.75rem; color: #64748b; }
        .sidebar-footer { padding: 15px; }
        .btn-add-new { width: 100%; background: #fff; border: 1px dashed #6366f1; color: #6366f1; padding: 10px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }

        .erp-content { flex: 1; padding: 20px; overflow-y: auto; }
        .kpi-container { display: flex; gap: 15px; margin-bottom: 20px; }
        .kpi-card { flex: 1; background: #fff; padding: 15px; border-radius: 14px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; }
        .kpi-icon-mini { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .text-danger-bg { background: #fef2f2; color: #ef4444; }
        .text-success-bg { background: #f0fdf4; color: #22c55e; }
        .text-primary-bg { background: #eff6ff; color: #3b82f6; }
        .kpi-data label { font-size: 0.65rem; color: #64748b; text-transform: uppercase; font-weight: 800; display: block; }
        .kpi-data h5 { margin: 0; font-size: 1.15rem; font-weight: 800; }

        .ledger-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); position: relative; }
        .ledger-filter-row { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .date-group { display: flex; align-items: center; gap: 8px; }
        .date-group input { border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; }
        .btn-export-mini { background: #f8fafc; border: 1px solid #e2e8f0; font-size: 0.75rem; font-weight: 700; padding: 6px 15px; border-radius: 8px; }

        .table-wrapper { overflow-x: auto; }
        .erp-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .erp-table thead th { background: #f8fafc; padding: 14px 20px; text-align: left; font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #e2e8f0; }
        .erp-table td { padding: 14px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
        
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
        .status-badge.cleared { background: #dcfce7; color: #15803d; }
        .status-badge.pending { background: #fef9c3; color: #a16207; }
        .badge-balance { background: #f8fafc; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; border: 1px solid #e2e8f0; }

        /* --- Pagination Styling --- */
        .pagination-wrapper { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: #fff; border-top: 1px solid #f1f5f9; border-radius: 0 0 14px 14px; }
        .page-info { font-size: 0.8rem; color: #64748b; }
        .page-buttons { display: flex; gap: 10px; }
        .btn-page { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; }
        .btn-page:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
        .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }

        .print-header, .print-footer { display: none; }

        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .erp-content { padding: 0; width: 100%; }
          .ledger-box { border: none !important; box-shadow: none !important; }
          .table-wrapper { overflow: visible !important; }
          .erp-table { min-width: 100% !important; border: 1px solid #eee; }
          .print-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 25px; }
          .biz-info h1 { margin: 0; font-size: 24px; color: #000; }
          .print-footer { display: flex; justify-content: space-between; margin-top: 100px; padding: 0 20px; }
          .sig-box { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 5px; }
        }
      `}</style>
    </div>
  );
};

export default CustomerLedger;