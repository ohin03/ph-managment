import React, { useEffect, useState } from "react";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VendorReceive = () => {
  const [vendors, setVendors] = useState([]);
  const [receives, setReceives] = useState([]);

  const [form, setForm] = useState({
    _id: "",
    vendorId: "",
    amount: "",
    paymentMethod: "CASH",
    note: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    loadVendors();
    loadReceives();
  }, []);

  /* ================= LOAD VENDORS ================= */
  const loadVendors = async () => {
    try {
      const res = await api.get("/vendors");

      // SAFE ARRAY FIX
      const vendorData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setVendors(vendorData);
    } catch (err) {
      toast.error("Failed to load vendors ❌");
    }
  };

  /* ================= LOAD RECEIVES ================= */
  const loadReceives = async () => {
    try {
      const res = await api.get("/vendor-receive");

      const receiveData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setReceives(receiveData);
    } catch (err) {
      toast.error("Failed to load receive list ❌");
    }
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form.vendorId) return toast.warning("Select vendor");
    if (!form.amount || Number(form.amount) <= 0)
      return toast.warning("Enter valid amount");

    try {
      if (form._id) {
        await api.put(`/vendor-receive/${form._id}`, form);
        toast.success("Payment updated successfully ✅");
      } else {
        await api.post("/vendor-receive", form);
        toast.success("Payment received successfully ✅");
      }

      setForm({
        _id: "",
        vendorId: "",
        amount: "",
        paymentMethod: "CASH",
        note: "",
      });

      loadReceives();
      setCurrentPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Receive failed ❌");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (receive) => {
    setForm({
      _id: receive._id,
      vendorId: receive.vendorId?._id || "",
      amount: receive.amount,
      paymentMethod: receive.paymentMethod,
      note: receive.note,
    });
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this record?")) return;

    try {
      await api.delete(`/vendor-receive/${id}`);
      toast.success("Deleted successfully ✅");
      loadReceives();
    } catch (err) {
      toast.error("Delete failed ❌");
    }
  };

  /* ================= SEARCH ================= */
  const filteredReceives = receives.filter((r) =>
    r.vendorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredReceives.length / itemsPerPage);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentItems = filteredReceives.slice(indexOfFirst, indexOfLast);

  return (
    <div className="container my-4">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* ================= FORM ================= */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4>{form._id ? "Edit Vendor Receive" : "Vendor Receive"}</h4>
        </div>

        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-4">
              <select
                className="form-select"
                name="vendorId"
                value={form.vendorId}
                onChange={handleChange}
              >
                <option value="">Select Vendor</option>

                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.phone})
                  </option>
                ))}

              </select>
            </div>

            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
              >
                <option value="CASH">💵 Cash</option>
                <option value="BANK">🏦 Bank</option>
                <option value="MOBILE_BANKING">📱 Mobile Banking</option>
              </select>
            </div>

            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                name="note"
                placeholder="Note"
                value={form.note}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="text-end mt-3">
            <button className="btn btn-primary" onClick={handleSave}>
              {form._id ? "Update Receive" : "Confirm Receive"}
            </button>
          </div>
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className="card shadow-sm">

        <div className="card-header bg-dark text-white d-flex justify-content-between">
          <h4>Vendor Receive List</h4>

          <input
            type="text"
            className="form-control form-control-sm w-25"
            placeholder="Search Vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card-body table-responsive">

          <table className="table table-striped table-bordered text-center">

            <thead className="table-dark">
              <tr>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Note</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {currentItems.map((r) => (
                <tr key={r._id}>
                  <td>{r.vendorId?.name || "Unknown"}</td>
                  <td>{r.amount}</td>

                  <td>
                    {r.paymentMethod === "CASH"
                      ? "💵 Cash"
                      : r.paymentMethod === "BANK"
                      ? "🏦 Bank"
                      : "📱 Mobile"}
                  </td>

                  <td>{r.note}</td>

                  <td>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      className="btn btn-primary btn-sm me-1"
                      onClick={() => handleEdit(r)}
                    >
                      ✏️
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(r._id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReceives.length === 0 && (
                <tr>
                  <td colSpan="6">No receive records found</td>
                </tr>
              )}

            </tbody>

          </table>

          {/* ================= PAGINATION ================= */}

          <div className="d-flex justify-content-center gap-2 mt-3">

            <button
              className="btn btn-outline-primary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ◀ Previous
            </button>

            <span className="fw-bold">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              className="btn btn-outline-primary btn-sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next ▶
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorReceive;