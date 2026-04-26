import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVendorLedger } from "../api/ledgerApi";
import { getVendors } from "../api/vendorApi";
import { toast } from "react-toastify";

const VendorLedger = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load all vendors for dropdown
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await getVendors("", 1, 1000); // সব vendors নিয়ে আসছি
        setVendors(res.data); // শুধু array রাখো
      } catch {
        toast.error("Failed to load vendors");
      }
    };
    fetchVendors();
  }, []);

  // Fetch ledger when vendorId changes
  const fetchLedger = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getVendorLedger(id);
      setLedger(data.entries || []);
      setBalance(data.currentDue || 0);
    } catch {
      toast.error("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) fetchLedger(vendorId);
  }, [vendorId]);

  const selectedVendor = vendors.find((v) => v._id === vendorId); // এখন ঠিকঠাক কাজ করবে

  return (
    <div className="container-fluid py-4">
      <h3 className="fw-bold mb-3">Vendor Ledger</h3>

      {/* Vendor Selector */}
      <div className="d-flex justify-content-center mb-4">
        <select
          className="form-select w-50"
          value={vendorId || ""}
          onChange={(e) => navigate(`/vendor-ledger/${e.target.value}`)}
        >
          <option value="">Select Vendor...</option>
          {vendors.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name} {v.company ? `(${v.company})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {selectedVendor && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow text-center p-3">
              <h6>Current Balance</h6>
              <h3 className={balance > 0 ? "text-danger" : "text-success"}>
                ৳ {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow text-center p-3">
              <h6>Total Transactions</h6>
              <h3>{ledger.length}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow text-center p-3">
              <h6>Status</h6>
              <h3 className={balance > 0 ? "text-danger" : "text-success"}>
                {balance > 0 ? "Due Pending" : "Cleared"}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="card shadow">
        <div className="card-header bg-dark text-white fw-semibold">
          Transaction Details
          <button
            className="btn btn-light btn-sm float-end"
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0 text-center">
                <thead className="table-light">
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
                      <td colSpan="6" className="py-4 text-muted">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    ledger.map((entry) => (
                      <tr key={entry._id}>
                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="fw-semibold">{entry.reference}</td>
                        <td>{entry.description}</td>
                        <td className="text-danger fw-semibold">
                          {entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-success fw-semibold">
                          {entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

export default VendorLedger;