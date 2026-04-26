import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const VendorSales = () => {
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [note, setNote] = useState("");
  const [sales, setSales] = useState([]);
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Load vendors and sales
  const loadData = async () => {
    try {
      const v = await api.get("/vendors?page=1&limit=1000"); // সব vendors
      const s = await api.get("/vendor-sales");

      // vendors safe handling
      setVendors(Array.isArray(v.data) ? v.data : v.data.data || []);
      setSales(s.data);
    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setVendorId("");
    setAmount("");
    setPaid("");
    setNote("");
    setPaymentMethod("Cash");
    setEditId(null);
  };

  const handleSave = async () => {
    if (!vendorId || !amount) return toast.error("Fill all required fields");

    try {
      const payload = {
        vendorId,
        amount: Number(amount),
        paidAmount: Number(paid || 0),
        paymentMethod,
        note,
      };

      if (editId) {
        await api.put(`/vendor-sales/${editId}`, payload);
        toast.success("Updated Successfully ✅");
      } else {
        await api.post("/vendor-sales", payload);
        toast.success("Vendor Sale Saved ✅");
      }

      resetForm();
      setCurrentPage(1); // নতুন data হলে first page
      loadData();
    } catch (err) {
      toast.error("Operation Failed ❌");
      console.error(err);
    }
  };

  const handleEdit = (sale) => {
    setEditId(sale._id);
    setVendorId(sale.vendorId?._id);
    setAmount(sale.amount);
    setPaid(sale.paidAmount);
    setPaymentMethod(sale.paymentMethod);
    setNote(sale.note);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this?")) return;
    try {
      await api.delete(`/vendor-sales/${id}`);
      toast.success("Deleted");
      loadData();
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  // Pagination
  const totalPages = Math.ceil(sales.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const currentData = sales.slice(startIndex, startIndex + limit);

  return (
    <div className="container mt-4">
      <h3 className="mb-4">🏢 Vendor Sales</h3>

      {/* FORM */}
      <div className="card shadow p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="fw-bold">Vendor</label>
            <select
              className="form-select"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">Select Vendor</option>
              {Array.isArray(vendors) &&
                vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} {v.company ? `(${v.company})` : ""}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-3">
            <label>Total Amount</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label>Paid Amount</label>
            <input
              type="number"
              className="form-control"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label>Payment</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          <div className="col-md-12">
            <label>Note</label>
            <textarea
              className="form-control"
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="col-md-12 text-end">
            <button
              className={`btn ${editId ? "btn-warning" : "btn-success"} px-4`}
              onClick={handleSave}
            >
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="card shadow p-3">
        <h5>Vendor Sales List</h5>

        <table className="table table-bordered text-center mt-3">
          <thead className="table-dark">
            <tr>
              <th>Invoice</th>
              <th>Vendor</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-muted">
                  No sales found.
                </td>
              </tr>
            ) : (
              currentData.map((s) => (
                <tr key={s._id}>
                  <td>{s.invoiceNo}</td>
                  <td>{s.vendorId?.name}</td>
                  <td>{s.amount}</td>
                  <td>{s.paidAmount}</td>
                  <td>{s.dueAmount}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(s._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorSales;