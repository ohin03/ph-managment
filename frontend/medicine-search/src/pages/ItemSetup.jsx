import React, { useEffect, useState } from "react";
import { getItems, deleteItem, addItem, updateItem } from "../api/itemApi";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const ItemSetup = () => {

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const limit = 10;

  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    companyName: "",
    stock: "",
    purchasePrice: "",
    salesPrice: "",
    expiryDate: "",
    batchNo: ""
  });

  // ================= FETCH ITEMS =================
  const fetchItems = async () => {
    try {
      const res = await getItems(page, limit);

      const data = res.items || [];

      // normalize old + new structure
      const normalized = data.map((item) => ({
        _id: item._id,
        name: item.name || item.item_name || "",
        genericName: item.genericName || item.generic_name || "",
        companyName: item.companyName || item.company_name || "",
        stock: item.stock || 0,
        purchasePrice: item.purchasePrice || 0,
        expiryDate: item.expiryDate || item.expiry_date || "",
        batchNo: item.batchNo || ""
      }));

      setItems(normalized);
      setTotal(res.total || 0);

    } catch (err) {
      console.error(err);
      toast.error("Medicine load failed ❌");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  // ================= FORM CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!formData.name.trim()) {
      return toast.error("Medicine Name required ❌");
    }

    const payload = {
      ...formData,
      stock: Number(formData.stock),
      purchasePrice: Number(formData.purchasePrice)
    };

    try {
      if (editId) {
        await updateItem(editId, payload);
        toast.success("Medicine Updated ✅");
        setEditId(null);
      } else {
        await addItem(payload);
        toast.success("Medicine Added ✅");
        setPage(1); // new item always first page
      }

      setFormData({
        name: "",
        genericName: "",
        companyName: "",
        stock: "",
        purchasePrice: "",
        expiryDate: "",
        batchNo: ""
      });

      fetchItems();

    } catch {
      toast.error("Save failed ❌");
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditId(item._id);

    setFormData({
      name: item.name,
      genericName: item.genericName,
      companyName: item.companyName,
      stock: item.stock,
      purchasePrice: item.purchasePrice,
      salesPrice: item.salesPrice || "",
      expiryDate: item.expiryDate?.substring(0, 10) || "",
      batchNo: item.batchNo
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;

    try {
      await deleteItem(id);
      toast.success("Deleted Successfully 🗑️");
      fetchItems();
    } catch {
      toast.error("Delete Failed ❌");
    }
  };

  const totalPage = Math.ceil(total / limit);

  return (
    <div className="container my-4">

      <ToastContainer position="top-right" autoClose={3000} />

      {/* ================= FORM ================= */}
      <div className="card mb-4 shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            {editId ? "Edit Medicine" : "Medicine Setup"}
          </h4>
        </div>

        <div className="card-body">

          <div className="row mb-3">
            <div className="col-md-4">
              <input
                name="name"
                placeholder="Medicine Name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <input
                name="genericName"
                placeholder="Generic Name"
                className="form-control"
                value={formData.genericName}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <input
                name="companyName"
                placeholder="Company Name"
                className="form-control"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-3">
              <input type="number" name="stock" placeholder="Stock"
                className="form-control"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <input type="number" name="purchasePrice" placeholder="Purchase Price"
                className="form-control"
                value={formData.purchasePrice}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <input type="number" name="salesPrice" placeholder="Sale Price"
                className="form-control"
                value={formData.salesPrice}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <input type="date" name="expiryDate"
                className="form-control"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="text-end">
            <button className="btn btn-success me-2" onClick={handleSave}>
              {editId ? "Update Medicine" : "Save Medicine"}
            </button>

            {editId && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditId(null);
                  setFormData({
                    name: "",
                    genericName: "",
                    companyName: "",
                    stock: "",
                    purchasePrice: "",
                    salesPrice: "",
                    expiryDate: "",
                    batchNo: ""
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card shadow">
        <div className="card-header bg-dark text-white">
          <h4 className="mb-0">Medicine List</h4>
        </div>

        <div className="card-body table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Generic</th>
                <th>Company</th>
                <th>Stock</th>
                <th>Purchase Price</th>
                <th>Sale Price</th>
                <th>Expiry</th>
                <th>Batch</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.genericName}</td>
                  <td>{item.companyName}</td>
                  <td>{item.stock}</td>
                  <td>{item.purchasePrice}</td>
                  <td>{item.salesPrice || 0}</td>
                  <td>
                    {item.expiryDate
                      ? new Date(item.expiryDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{item.batchNo}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center">
                    No Medicines Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ================= PAGINATION ================= */}
          {totalPage > 1 && (
            <div className="text-center mt-3">
              <button
                className="btn btn-primary me-2"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>

              <span>Page {page} / {totalPage}</span>

              <button
                className="btn btn-primary ms-2"
                disabled={page === totalPage}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default ItemSetup;