import React, { useEffect, useState } from "react";
import { getCustomerLedger } from "../api/ledgerApi";
import { getCustomers } from "../api/customerApi";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const CustomerLedger = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load all customers once
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomers();
        setCustomers(res.data || []);
      } catch {
        toast.error("Failed to load customers");
      }
    };
    fetchCustomers();
  }, []);

  // Sync selected customer with URL param
  useEffect(() => {
    if (!customerId || !customers.length) return;
    const found = customers.find((c) => c._id === customerId);
    setSelectedCustomer(found || null);
  }, [customerId, customers]);

  const fetchLedger = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      const data = await getCustomerLedger(customerId);
      setLedger(data.entries || []);
      setBalance(data.currentDue || 0);
    } catch {
      toast.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [customerId]);

  return (
    <div className="container-fluid py-5" style={{ fontFamily: "Arial, sans-serif" }}>
      
      {/* ================= HEADER ================= */}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.9rem" }}>Customer Ledger</h2>
        <p className="text-secondary mb-3">Transaction history & running balance overview</p>

        {/* Customer selector & actions */}
        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
          <select
            className="form-select form-select-sm shadow-sm"
            style={{ minWidth: 240, maxWidth: 280, borderRadius: 8 }}
            value={customerId || ""}
            onChange={(e) => {
              const id = e.target.value;
              if (id) navigate(`/customer-ledger/${id}`);
            }}
          >
            <option value="">Select customer...</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>

          <button className="btn btn-outline-primary btn-sm shadow-sm" onClick={() => window.print()}>
            <i className="fa fa-print me-1"></i> Print
          </button>

          <button className="btn btn-primary btn-sm shadow-sm" onClick={fetchLedger}>
            <i className="fa fa-sync me-1"></i> Refresh
          </button>
        </div>

        {selectedCustomer && (
          <div className="mt-2 small text-muted">
            <span className="fw-semibold">{selectedCustomer.name}</span>
            {selectedCustomer.phone && <> • {selectedCustomer.phone}</>}
          </div>
        )}
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="row mb-4 justify-content-center g-3">
        {[
          {
            title: "Current Balance",
            value: `৳ ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            gradient: balance > 0 ? "linear-gradient(90deg,#ff4d4d,#ff9999)" : "linear-gradient(90deg,#4caf50,#a8e6a1)"
          },
          { title: "Total Transactions", value: ledger.length, gradient: "linear-gradient(90deg,#1976d2,#90caf9)" },
          {
            title: "Status",
            value: balance > 0 ? "Due Pending" : "Cleared",
            gradient: balance > 0 ? "linear-gradient(90deg,#ff4d4d,#ff9999)" : "linear-gradient(90deg,#4caf50,#a8e6a1)"
          },
        ].map((card, idx) => (
          <div key={idx} className="col-md-3 col-sm-6">
            <div className="card shadow-sm border-0 text-white" style={{ borderRadius: 12, background: card.gradient }}>
              <div className="card-body text-center p-3">
                <h6 className="mb-1" style={{ opacity: 0.9 }}>{card.title}</h6>
                <h5 className="fw-bold mb-0">{card.value}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= LEDGER TABLE ================= */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white fw-semibold" style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          Transaction Details
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-center">
                <thead className="table-light sticky-top" style={{ top: 0 }}>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th className="text-danger">Debit (৳)</th>
                    <th className="text-success">Credit (৳)</th>
                    <th>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-4 text-muted">No transactions found.</td>
                    </tr>
                  ) : (
                    ledger.map((entry) => (
                      <tr key={entry._id} className="align-middle">
                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="fw-semibold">{entry.reference}</td>
                        <td>{entry.description}</td>
                        <td className="text-danger fw-semibold">
                          {entry.debit ? entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                        </td>
                        <td className="text-success fw-semibold">
                          {entry.credit ? entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                        </td>
                        <td className="fw-bold">
                          ৳ {entry.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLedger;