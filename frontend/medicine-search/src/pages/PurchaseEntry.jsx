import React, { useState, useEffect } from "react";
import api from "../services/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';

const PurchaseEntry = () => {
  const today = new Date().toISOString().split("T")[0];

  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now()}`);
  const [purchaseDate] = useState(today);
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([
    { medicine: "", batch: "", quantity: "", price: "", expiryDate: "", total: 0 },
  ]);

  const [purchaseList, setPurchaseList] = useState([]);
  const [editId, setEditId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load purchases
  const fetchPurchases = async () => {
    try {
      const res = await api.get("/purchases");
      setPurchaseList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Handle item change
  const handleChange = (index, e) => {
    const values = [...items];
    values[index][e.target.name] = e.target.value;

    const qty = Number(values[index].quantity) || 0;
    const price = Number(values[index].price) || 0;
    values[index].total = qty * price;

    setItems(values);
  };

  const addRow = () => {
    setItems([...items, { medicine: "", batch: "", quantity: "", price: "", expiryDate: "", total: 0 }]);
  };

  const removeRow = (index) => {
    const values = [...items];
    values.splice(index, 1);
    setItems(values);
  };

  const grandTotal = items.reduce((sum, item) => sum + Number(item.total), 0);

  // Pagination calculations
  const totalPages = Math.ceil(purchaseList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = purchaseList.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Save or update
  const handleSave = async () => {
    if (!supplier) return toast.error("Supplier required");

    const validItems = items.filter(
      i => i.medicine && i.batch && i.quantity && i.price && i.expiryDate
    );

    if (validItems.length === 0) return toast.error("No valid items to save!");

    const payload = { invoiceNo, purchaseDate, supplier, items: validItems, grandTotal };

    try {
      if (editId) {
        await api.put(`/purchases/${editId}`, payload);
        toast.success("Purchase updated successfully!");
        setEditId(null);
      } else {
        await api.post("/purchases", payload);
        toast.success("Purchase saved successfully!");
      }

      fetchPurchases();
      setInvoiceNo(`INV-${Date.now()}`);
      setSupplier("");
      setItems([{ medicine: "", batch: "", quantity: "", price: "", expiryDate: "", total: 0 }]);
    } catch (err) {
      console.log(err);
      toast.error("Error saving purchase");
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await api.delete(`/purchases/${id}`);
      fetchPurchases();
      toast.info("Purchase deleted");
    } catch (err) {
      console.log(err);
      toast.error("Error deleting purchase");
    }
  };

  const handleEdit = (p) => {
    setEditId(p._id);
    setInvoiceNo(p.invoiceNo);
    setSupplier(p.supplier);
    setItems(p.items);
  };

  return (
    <div className="container my-4">

      <ToastContainer position="top-right" autoClose={3000} />

      {/* ===== Purchase Entry Form ===== */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Purchase Entry</h4>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <input type="text" className="form-control text-primary fw-bold" value={invoiceNo} readOnly />
            </div>
            <div className="col-md-4">
              <input type="text" className="form-control text-success fw-bold" value={purchaseDate} readOnly />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Supplier Name"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive mb-3">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Expiry Date</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td><input name="medicine" className="form-control" value={item.medicine} onChange={e => handleChange(idx, e)} /></td>
                    <td><input name="batch" className="form-control" value={item.batch} onChange={e => handleChange(idx, e)} /></td>
                    <td><input name="quantity" type="number" className="form-control" value={item.quantity} onChange={e => handleChange(idx, e)} /></td>
                    <td><input name="price" type="number" className="form-control" value={item.price} onChange={e => handleChange(idx, e)} /></td>
                    <td><input name="expiryDate" type="date" className="form-control" value={item.expiryDate} onChange={e => handleChange(idx, e)} /></td>
                    <td><input className="form-control text-success fw-bold" value={item.total} readOnly /></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => removeRow(idx)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <h5>Grand Total: {grandTotal}</h5>
            <div>
              <button className="btn btn-success me-2" onClick={addRow}>+ Add Item</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId ? "Update Purchase" : "Save Purchase"}</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Purchase List with Pagination ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white">
          <h4 className="mb-0">Purchase List</h4>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(p => (
                <tr key={p._id}>
                  <td>{p.invoiceNo}</td>
                  <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                  <td>{p.supplier}</td>
                  <td>{p.grandTotal}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteInvoice(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Buttons */}
          <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              ◀ Previous
            </button>

            <span className="fw-bold">Page {currentPage} of {totalPages || 1}</span>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={nextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next ▶
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default PurchaseEntry;