import React, { useState, useEffect } from "react";
import api from "../services/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PurchaseReturn = () => {
  const today = new Date().toISOString().split("T")[0];

  const [purchaseList, setPurchaseList] = useState([]);
  const [returnList, setReturnList] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [returnQty, setReturnQty] = useState("");
  const [editId, setEditId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load purchases & returns
  const fetchPurchases = async () => {
    const res = await api.get("/purchases");
    setPurchaseList(res.data);
  };

  const fetchReturns = async () => {
    const res = await api.get("/purchase-returns");
    setReturnList(res.data);
  };

  useEffect(() => {
    fetchPurchases();
    fetchReturns();
  }, []);

  // Select Invoice
  const handleSelect = (id) => {
    const purchase = purchaseList.find((p) => p._id === id);
    setSelectedPurchase(purchase);
    setReturnQty("");
    setEditId(null);
  };

  // Save / Update
  const handleSave = async () => {
    if (!selectedPurchase) return toast.error("Select Invoice");
    if (!returnQty || returnQty <= 0) return toast.error("Invalid Return Qty");

    const purchaseQty = selectedPurchase.items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

    const alreadyReturned = returnList
      .filter((r) => r.invoiceId === selectedPurchase._id && r._id !== editId)
      .reduce((sum, r) => sum + r.returnQty, 0);

    if (Number(returnQty) + alreadyReturned > purchaseQty)
      return toast.error("Return exceeds purchase quantity!");

    const data = {
      invoiceId: selectedPurchase._id,
      invoiceNo: selectedPurchase.invoiceNo,
      supplier: selectedPurchase.supplier,
      purchaseQty,
      returnQty: Number(returnQty),
      returnDate: today,
    };

    try {
      if (editId) {
        await api.put(`/purchase-returns/${editId}`, data);
        toast.success("Return updated successfully");
        setEditId(null);
      } else {
        await api.post("/purchase-returns", data);
        toast.success("Return saved successfully");
      }
      setSelectedPurchase(null);
      setReturnQty("");
      fetchReturns();
    } catch (err) {
      console.log(err);
      toast.error("Error processing return");
    }
  };

  // Edit
  const handleEdit = (r) => {
    setEditId(r._id);
    setReturnQty(r.returnQty);
    const purchase = purchaseList.find((p) => p._id === r.invoiceId);
    setSelectedPurchase(purchase);
  };

  // Delete
  const handleDelete = async (id) => {
    await api.delete(`/purchase-returns/${id}`);
    fetchReturns();
    toast.info("Return deleted");
  };

  // ===== Pagination calculations =====
  const totalPages = Math.ceil(returnList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = returnList.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container my-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ===== RETURN FORM ===== */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Purchase Return</h4>
        </div>
        <div className="card-body">

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label>Invoice</label>
              <select 
                className="form-select" 
                onChange={(e) => handleSelect(e.target.value)} 
                value={selectedPurchase?._id || ""}
                style={{fontWeight: "500", color: "#0d6efd"}}
              >
                <option value="">Select Invoice</option>
                {purchaseList.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.invoiceNo} - {p.supplier}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label>Date</label>
              <input type="text" className="form-control text-success fw-bold" value={today} readOnly />
            </div>

            <div className="col-md-3">
              <label>Supplier</label>
              <input type="text" className="form-control text-success fw-bold" value={selectedPurchase?.supplier || ""} readOnly />
            </div>
          </div>

          {/* ===== Purchase / Return / Remaining Row ===== */}
          <div className="row g-3 mb-3 align-items-end">
            <div className="col-md-4">
              <label>Purchase Qty</label>
              <input
                type="text"
                className="form-control text-success fw-bold"
                value={selectedPurchase ? selectedPurchase.items.reduce((sum, i) => sum + Number(i.quantity), 0) : 0}
                readOnly
              />
            </div>

            <div className="col-md-4">
              <label>Return Qty</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="Enter Return Qty"
                value={returnQty}
                onChange={(e) => setReturnQty(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label>Remaining</label>
              <input
                type="text"
                className="form-control text-danger fw-bold"
                value={
                  selectedPurchase
                    ? selectedPurchase.items.reduce((sum, i) => sum + Number(i.quantity), 0) -
                      returnList
                        .filter((r) => r.invoiceId === selectedPurchase._id && r._id !== editId)
                        .reduce((sum, r) => sum + r.returnQty, 0) -
                      Number(returnQty || 0)
                    : 0
                }
                readOnly
              />
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button className="btn btn-primary me-2" onClick={handleSave}>
              {editId ? "Update Return" : "Save Return"}
            </button>
            {selectedPurchase && (
              <button className="btn btn-secondary" onClick={() => setSelectedPurchase(null)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== RETURN LIST with Pagination ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white">
          <h4 className="mb-0">Purchase Return List</h4>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Purchase Qty</th>
                <th>Return Qty</th>
                <th>Remaining</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((r) => (
                <tr key={r._id}>
                  <td>{r.invoiceNo}</td>
                  <td>{r.returnDate}</td>
                  <td>{r.supplier}</td>
                  <td>{r.purchaseQty}</td>
                  <td>{r.returnQty}</td>
                  <td>{r.purchaseQty - r.returnQty}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(r)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Delete</button>
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

export default PurchaseReturn;