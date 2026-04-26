import React, { useState, useEffect } from "react";
import { addItem, updateItem } from "../../api/itemApi";
import { toast } from "react-toastify";

const ItemModal = ({ isOpen, onClose, onSave, editItem }) => {

  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    companyName: "",
    stock: 0,
    purchasePrice: 0,
    expiryDate: "",
    batchNo: ""
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || "",
        genericName: editItem.genericName || "",
        companyName: editItem.companyName || "",
        stock: editItem.stock || 0,
        purchasePrice: editItem.purchasePrice || 0,
        expiryDate: editItem.expiryDate
          ? editItem.expiryDate.substring(0, 10)
          : "",
        batchNo: editItem.batchNo || ""
      });
    } else {
      setFormData({
        name: "",
        genericName: "",
        companyName: "",
        stock: 0,
        purchasePrice: 0,
        expiryDate: "",
        batchNo: ""
      });
    }
  }, [editItem]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.name.trim()) {
        toast.error("Item Name দিতে হবে ❌");
        return;
      }

      const payload = {
        ...formData,
        stock: Number(formData.stock),
        purchasePrice: Number(formData.purchasePrice)
      };

      if (editItem) {
        await updateItem(editItem._id, payload);
        toast.success("Item Updated Successfully ✅");
      } else {
        await addItem(payload);
        toast.success("Item Added Successfully ✅");
      }

      onSave();
      onClose();

    } catch (err) {
      toast.error(err.message || "Something went wrong ❌");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-wrapper">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">

          <h5>{editItem ? "Edit Medicine" : "Add Medicine"}</h5>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Medicine Name"
              value={formData.name}
              onChange={handleChange}
              className="form-control mb-2"
              required
            />

            <input
              type="text"
              name="genericName"
              placeholder="Generic Name"
              value={formData.genericName}
              onChange={handleChange}
              className="form-control mb-2"
            />

            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
              className="form-control mb-2"
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              className="form-control mb-2"
            />

            <input
              type="number"
              name="purchasePrice"
              placeholder="Purchase Price"
              value={formData.purchasePrice}
              onChange={handleChange}
              className="form-control mb-2"
            />

            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="form-control mb-2"
            />

            <input
              type="text"
              name="batchNo"
              placeholder="Batch No"
              value={formData.batchNo}
              onChange={handleChange}
              className="form-control mb-3"
            />

            <button type="submit" className="btn btn-primary me-2">
              {editItem ? "Update" : "Add"}
            </button>

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;