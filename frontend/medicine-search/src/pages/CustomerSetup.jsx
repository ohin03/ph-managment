// src/pages/CustomerSetup.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const CustomerSetup = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    customerType: "REGULAR",
    openingBalance: 0,
    status: "ACTIVE",
  });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load customers
  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch {
      toast.error("Failed to load customers");
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Save / Update
  const handleSave = async () => {
    if (!form.name || !form.phone) return toast.error("Name and Phone required");

    try {
      if (editId) {
        await api.put(`/customers/${editId}`, form);
        toast.success("Customer updated!");
        setEditId(null);
      } else {
        await api.post("/customers", form);
        toast.success("Customer added!");
      }
      setForm({ name: "", phone: "", address: "", customerType: "REGULAR", openingBalance: 0, status: "ACTIVE" });
      loadCustomers();
      setCurrentPage(1);
    } catch {
      toast.error(editId ? "Update failed" : "Add failed");
    }
  };

  // Edit customer
  const handleEdit = (c) => {
    setEditId(c._id);
    setForm({
      name: c.name,
      phone: c.phone,
      address: c.address,
      customerType: c.customerType,
      openingBalance: c.openingBalance,
      status: c.status
    });
  };

  // Delete customer
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.info("Customer deleted!");
      loadCustomers();
    } catch {
      toast.error("Delete failed");
    }
  };

  // View Ledger
  const viewLedger = (c) => {
    navigate(`/customer-ledger/${c._id}`);
  };

  // Pagination
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container my-4">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* ===== Customer Form ===== */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">{editId ? "Edit Customer" : "Add Customer"}</h4>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input className="form-control" name="name" placeholder="Customer Name" value={form.name} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <input className="form-control" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <input className="form-control" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <select className="form-select" name="customerType" value={form.customerType} onChange={handleChange}>
                <option value="REGULAR">Regular</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>
            {form.customerType === "CREDIT" && (
              <div className="col-md-3 mt-2">
                <input type="number" className="form-control" name="openingBalance" placeholder="Opening Balance" value={form.openingBalance} onChange={handleChange} />
              </div>
            )}
            <div className="col-md-3 mt-2">
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>

          <div className="mt-3 text-end">
            <button className="btn btn-success" onClick={handleSave}>
              {editId ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Customer List ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h4 className="mb-0">Customer List</h4>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-striped table-bordered text-center align-middle">
            <thead style={{ backgroundColor: "#343a40", color: "#fff" }}>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.customerType}</td>
                  <td>{c.status}</td>
                  <td>{c.openingBalance}</td>
                  <td>
                    <button className="btn btn-info btn-sm me-1" onClick={() => viewLedger(c)}>Ledger</button>
                    <button className="btn btn-warning btn-sm me-1" onClick={() => handleEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setCurrentPage(p => Math.max(p-1,1))}
              disabled={currentPage === 1}
            >
              ◀ Previous
            </button>
            <span className="fw-bold">Page {currentPage} of {totalPages || 1}</span>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))}
              disabled={currentPage === totalPages || totalPages===0}
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSetup;