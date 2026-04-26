import React, { useEffect, useState } from "react";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomerReceive = () => {
  const [customers, setCustomers] = useState([]);
  const [receives, setReceives] = useState([]);
  const [form, setForm] = useState({
    _id: "",
    customerId: "",
    amount: "",
    paymentMethod: "CASH",
    note: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    loadCustomers();
    loadReceives();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      toast.error("Failed to load customers ❌");
    }
  };

  const loadReceives = async () => {
    try {
      const res = await api.get("/customer-receive");
      setReceives(res.data);
    } catch (err) {
      toast.error("Failed to load receive list ❌");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    if (!form.customerId) return toast.warning("Select customer");
    if (!form.amount || Number(form.amount) <= 0) return toast.warning("Enter valid amount");

    try {
      if (form._id) {
        await api.put(`/customer-receive/${form._id}`, form);
        toast.success("Payment updated successfully ✅");
      } else {
        await api.post("/customer-receive", form);
        toast.success("Payment received successfully ✅");
      }

      setForm({ _id: "", customerId: "", amount: "", paymentMethod: "CASH", note: "" });
      await loadReceives();
      setCurrentPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Receive failed ❌");
    }
  };

  const handleEdit = (receive) => {
    setForm({
      _id: receive._id,
      customerId: receive.customerId._id,
      amount: receive.amount,
      paymentMethod: receive.paymentMethod,
      note: receive.note,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this record?")) return;
    try {
      await api.delete(`/customer-receive/${id}`);
      toast.info("Deleted successfully ✅");
      await loadReceives();
    } catch (err) {
      toast.error("Delete failed ❌");
    }
  };

  const filteredReceives = receives.filter((r) =>
    r.customerId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReceives.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredReceives.slice(indexOfFirst, indexOfLast);

  return (
    <div className="container my-4">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Customer Receive Form */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-success text-white">
          <h4 className="mb-0">{form._id ? "Edit Receive" : "Customer Receive"}</h4>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <select className="form-select" name="customerId" value={form.customerId} onChange={handleChange}>
                <option value="">Select Customer</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <input type="number" className="form-control" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <select className="form-select" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                <option value="CASH">💵 Cash</option>
                <option value="BANK">🏦 Bank</option>
                <option value="MOBILE_BANKING">📱 Mobile Banking</option>
              </select>
            </div>
            <div className="col-md-6 mt-2">
              <input type="text" className="form-control" name="note" placeholder="Note" value={form.note} onChange={handleChange} />
            </div>
          </div>
          <div className="mt-3 text-end">
            <button className="btn btn-success" onClick={handleSave}>{form._id ? "Update Receive" : "Confirm Receive"}</button>
          </div>
        </div>
      </div>

      {/* Receive List */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Receive List</h4>
          <input type="text" className="form-control form-control-sm w-25" placeholder="Search Customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="card-body table-responsive">
          <table className="table table-striped table-bordered text-center align-middle">
            <thead style={{ backgroundColor: "#343a40", color: "#fff" }}>
              <tr>
                <th>Customer</th>
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
                  <td>{r.customerId?.name || "Unknown"}</td>
                  <td>{r.amount}</td>
                  <td>{r.paymentMethod === "CASH" ? "💵 Cash" : r.paymentMethod === "BANK" ? "🏦 Bank" : "📱 Mobile"}</td>
                  <td>{r.note}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-primary btn-sm me-1" onClick={() => handleEdit(r)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
              {filteredReceives.length === 0 && <tr><td colSpan="6" className="text-muted">No receive records found</td></tr>}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
            <button className="btn btn-outline-primary btn-sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀ Previous</button>
            <span className="fw-bold">Page {currentPage} of {totalPages || 1}</span>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Next ▶</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReceive;