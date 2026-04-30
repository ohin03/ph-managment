import React, { useState, useEffect } from "react";
import api from "../services/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';

const createEmptyItem = () => ({
  medicineId: "",
  medicine: "",
  batch: "",
  quantity: "",
  price: "",
  salePrice: "",
  expiryDate: "",
  total: 0
});

const PurchaseEntry = () => {
  const today = new Date().toISOString().split("T")[0];

  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now()}`);
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([createEmptyItem()]);

  const [purchaseList, setPurchaseList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState({});
  const [showCreateForRow, setShowCreateForRow] = useState({});
  const [createRowIndex, setCreateRowIndex] = useState(null);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineGenericName, setNewMedicineGenericName] = useState("");
  const [newMedicineUnit, setNewMedicineUnit] = useState("pcs");
  const [newMedicineStock, setNewMedicineStock] = useState(0);
  const [creatingMedicine, setCreatingMedicine] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load purchases
  const fetchPurchases = async () => {
    try {
      setLoadingList(true);
      const res = await api.get("/purchases");
      setPurchaseList(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load purchases");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Handle item change
  const handleChange = (index, e) => {
    const values = [...items];
    values[index][e.target.name] = e.target.value;

    const qty = Number(values[index].quantity || 0);
    const price = Number(values[index].price || 0);
    values[index].total = qty * price;

    setItems(values);
  };

  const handleMedicineSearch = async (index, value) => {
    const values = [...items];
    values[index].medicine = value;
    values[index].medicineId = "";
    setItems(values);

    if (!value.trim()) {
      setSearchResults((prev) => ({ ...prev, [index]: [] }));
      setShowCreateForRow((prev) => ({ ...prev, [index]: false }));
      return;
    }

    try {
      const res = await api.get(`/medicines/search?q=${encodeURIComponent(value)}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setSearchResults((prev) => ({ ...prev, [index]: list }));
      setShowCreateForRow((prev) => ({ ...prev, [index]: list.length === 0 }));
    } catch {
      setSearchResults((prev) => ({ ...prev, [index]: [] }));
      setShowCreateForRow((prev) => ({ ...prev, [index]: true }));
    }
  };

  const handleSelectMedicine = (index, med) => {
    const values = [...items];
    const selectedName = med.name || med.item_name || "";
    values[index].medicineId = med._id;
    values[index].medicine = selectedName;
    if (!values[index].price || Number(values[index].price) <= 0) {
      values[index].price = Number(med.purchasePrice || med.purchase_price || 0);
    }
    if (!values[index].salePrice) {
      values[index].salePrice = Number(med.salesPrice || med.sales_price || med.purchasePrice || med.purchase_price || 0);
    }
    const qty = Number(values[index].quantity || 0);
    const price = Number(values[index].price || 0);
    values[index].total = qty * price;
    setItems(values);
    setSearchResults((prev) => ({ ...prev, [index]: [] }));
    setShowCreateForRow((prev) => ({ ...prev, [index]: false }));
  };

  const openCreateMedicine = (rowIndex) => {
    setCreateRowIndex(rowIndex);
    setNewMedicineName(items[rowIndex]?.medicine || "");
    setNewMedicineGenericName("");
    setNewMedicineUnit("pcs");
    setNewMedicineStock(0);
  };

  const handleCreateMedicine = async () => {
    if (!newMedicineName.trim()) {
      return toast.error("Medicine name is required");
    }
    try {
      setCreatingMedicine(true);
      const res = await api.post("/medicines", {
        name: newMedicineName.trim(),
        genericName: newMedicineGenericName.trim(),
        unit: newMedicineUnit,
        stock: Number(newMedicineStock || 0),
      });
      const created = res.data?.data;
      if (!created) throw new Error("Invalid medicine response");

      if (createRowIndex !== null) {
        handleSelectMedicine(createRowIndex, created);
      }
      toast.success("Medicine created");
      setCreateRowIndex(null);
      setNewMedicineName("");
      setNewMedicineGenericName("");
      setNewMedicineUnit("pcs");
      setNewMedicineStock(0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create medicine");
    } finally {
      setCreatingMedicine(false);
    }
  };

  const addRow = () => {
    setItems([...items, createEmptyItem()]);
  };

  const removeRow = (index) => {
    if (items.length === 1) {
      return toast.info("At least one row is required");
    }
    const values = [...items];
    values.splice(index, 1);
    setItems(values);
  };

  const grandTotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0);

  const resetForm = () => {
    setInvoiceNo(`INV-${Date.now()}`);
    setPurchaseDate(today);
    setSupplier("");
    setItems([createEmptyItem()]);
    setEditId(null);
    setSearchResults({});
    setShowCreateForRow({});
  };

  const validateBeforeSave = () => {
    if (!supplier.trim()) {
      toast.error("Supplier required");
      return false;
    }

    if (!Array.isArray(items) || items.length === 0) {
      toast.error("At least one item required");
      return false;
    }

    for (let i = 0; i < items.length; i += 1) {
      const line = items[i];
      if (!line.medicine?.trim()) {
        toast.error(`Row ${i + 1}: medicine required`);
        return false;
      }
      if (!line.medicineId) {
        toast.warn(`Row ${i + 1}: Selected medicine not found in database. System will attempt to use the typed name.`);
      }
      if (!(Number(line.quantity) > 0)) {
        toast.error(`Row ${i + 1}: quantity must be greater than 0`);
        return false;
      }
      if (!(Number(line.price) > 0)) {
        toast.error(`Row ${i + 1}: price must be greater than 0`);
        return false;
      }
      if (line.salePrice !== undefined && line.salePrice !== "" && Number(line.salePrice) < 0) {
        toast.error(`Row ${i + 1}: sale price cannot be negative`);
        return false;
      }
      if (!line.expiryDate) {
        toast.error(`Row ${i + 1}: expiry date required`);
        return false;
      }
    }
    return true;
  };

  // Pagination calculations
  const filteredPurchaseList = purchaseList.filter((p) => {
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      String(p.invoiceNo || "").toLowerCase().includes(q) ||
      String(p.supplier || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredPurchaseList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchaseList.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Save or update
  const handleSave = async () => {
    if (!validateBeforeSave()) return;

    const payload = {
      invoiceNo,
      purchaseDate,
      supplier: supplier.trim(),
      items: items.map((line) => ({
        medicineId: line.medicineId || undefined,
        medicine: line.medicine?.trim(),
        batch: (line.batch || "").trim(),
        quantity: Number(line.quantity),
        price: Number(line.price),
        salePrice: line.salePrice === "" ? undefined : Number(line.salePrice),
        expiryDate: line.expiryDate
      }))
    };

    // Debug log
    console.log("Purchase payload:", JSON.stringify(payload, null, 2));

    try {
      setSaving(true);
      if (editId) {
        await api.put(`/purchases/${editId}`, payload);
        toast.success("Purchase updated successfully!");
      } else {
        await api.post("/purchases", payload);
        toast.success("Purchase saved successfully!");
      }

      await fetchPurchases();
      resetForm();
    } catch (err) {
      console.error("Purchase error:", err.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Error saving purchase");
    } finally {
      setSaving(false);
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this purchase?")) return;
    try {
      await api.delete(`/purchases/${id}`);
      await fetchPurchases();
      toast.info("Purchase deleted");
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Error deleting purchase");
    }
  };

  const handleEdit = (p) => {
    setEditId(p._id);
    setInvoiceNo(p.invoiceNo);
    setPurchaseDate(new Date(p.purchaseDate).toISOString().split("T")[0]);
    setSupplier(p.supplier);
    setItems(
      (p.items || []).map((line) => ({
        medicineId: line.medicineId || "",
        medicine: line.medicine || "",
        batch: line.batch || "",
        quantity: line.quantity || "",
        price: line.price || "",
        salePrice: line.salePrice !== undefined && line.salePrice !== null ? line.salePrice : "",
        expiryDate: line.expiryDate
          ? new Date(line.expiryDate).toISOString().split("T")[0]
          : "",
        total: Number(line.total || 0)
      }))
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              <input
                type="date"
                className="form-control text-success fw-bold"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
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
                  <th>Purchase Price</th>
                  <th>Sale Price</th>
                  <th>Expiry Date</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        name="medicine"
                        className="form-control"
                        value={item.medicine}
                        onChange={(e) => handleMedicineSearch(idx, e.target.value)}
                        placeholder="Search medicine..."
                        autoComplete="off"
                      />
                      {searchResults[idx]?.length > 0 && (
                        <div className="border rounded mt-1 bg-white" style={{ maxHeight: 160, overflowY: "auto" }}>
                          {searchResults[idx].map((m) => (
                            <button
                              key={m._id}
                              type="button"
                              className="btn btn-link text-start w-100 py-1 px-2 border-bottom"
                              onClick={() => handleSelectMedicine(idx, m)}
                            >
                              {(m.name || m.item_name)} | Stock: {Number(m.stock || 0)} | Last Price: {Number(m.purchasePrice || m.purchase_price || 0)} | Sale: {Number(m.salesPrice || m.sales_price || m.purchasePrice || m.purchase_price || 0)}
                            </button>
                          ))}
                        </div>
                      )}
                      {showCreateForRow[idx] && item.medicine?.trim() && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary mt-1"
                          onClick={() => openCreateMedicine(idx)}
                        >
                          Create New Medicine
                        </button>
                      )}
                    </td>
                    <td><input name="batch" className="form-control" value={item.batch} onChange={e => handleChange(idx, e)} /></td>
                    <td><input name="quantity" type="number" className="form-control" value={item.quantity} onChange={e => handleChange(idx, e)} /></td>
                    <td><input name="price" type="number" className="form-control" value={item.price} onChange={e => handleChange(idx, e)} /></td>
                    <td><input name="salePrice" type="number" className="form-control" value={item.salePrice} onChange={e => handleChange(idx, e)} /></td>
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
            <h5>Grand Total: {grandTotal.toFixed(2)}</h5>
            <div>
              <button className="btn btn-success me-2" onClick={addRow}>+ Add Item</button>
              {editId && (
                <button className="btn btn-secondary me-2" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editId ? "Update Purchase" : "Save Purchase"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {createRowIndex !== null && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Create New Medicine</h5>
          </div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-md-5">
                <input
                  className="form-control"
                  placeholder="Medicine name"
                  value={newMedicineName}
                  onChange={(e) => setNewMedicineName(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Generic name"
                  value={newMedicineGenericName}
                  onChange={(e) => setNewMedicineGenericName(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={newMedicineUnit}
                  onChange={(e) => setNewMedicineUnit(e.target.value)}
                >
                  <option value="pcs">pcs</option>
                  <option value="strip">strip</option>
                  <option value="box">box</option>
                  <option value="bottle">bottle</option>
                </select>
              </div>
              <div className="col-md-1">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Opening stock"
                  value={newMedicineStock}
                  onChange={(e) => setNewMedicineStock(e.target.value)}
                />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleCreateMedicine}
                  disabled={creatingMedicine}
                >
                  {creatingMedicine ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-secondary w-100"
                  onClick={() => setCreateRowIndex(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Purchase List with Pagination ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white">
          <h4 className="mb-0">Purchase List</h4>
        </div>
        <div className="card-body table-responsive">
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Search by invoice/supplier..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
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
              {loadingList ? (
                <tr>
                  <td colSpan={5} className="text-center">Loading...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">No purchases found</td>
                </tr>
              ) : (
                currentItems.map(p => (
                  <tr key={p._id}>
                    <td>{p.invoiceNo}</td>
                    <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                    <td>{p.supplier}</td>
                    <td>{Number(p.grandTotal || 0).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteInvoice(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
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