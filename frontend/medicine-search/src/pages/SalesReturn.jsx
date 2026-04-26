import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const SalesReturn = () => {
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [saleData, setSaleData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [returns, setReturns] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [editingReturnId, setEditingReturnId] = useState(null);

  // ===== LOAD RETURN LIST =====
  const loadReturns = async () => {
    try {
      const res = await api.get("/sales-return");
      setReturns(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load return list");
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // ===== SEARCH SALE =====
  const handleSearch = async () => {
    try {
      const res = await api.get("/sales");
      const found = res.data.find((s) => s.invoiceNo === invoiceSearch);
      if (!found) return toast.error("Invoice not found");

      setSaleData(found);
      setReturnItems(
        found.items.map((i) => ({
          ...i,
          returnQty: 0,
          total: 0,
        }))
      );
      setEditingReturnId(null); // new return
    } catch (err) {
      console.error(err);
      toast.error("Search Failed");
    }
  };

  // ===== UPDATE RETURN QTY =====
  const updateQty = (index, value) => {
    const updated = [...returnItems];
    let qty = Number(value);

    if (qty < 0) {
      toast.error("Return qty cannot be negative");
      return;
    }

    if (qty > updated[index].quantity) {
      toast.error("Return qty cannot exceed sold qty");
      return;
    }

    updated[index].returnQty = qty;
    updated[index].total = qty * updated[index].price;

    setReturnItems(updated);
    setTotal(updated.reduce((acc, item) => acc + (item.total || 0), 0));
  };

  // ===== SAVE NEW OR UPDATE RETURN =====
  const handleSave = async () => {
    const itemsToReturn = returnItems
      .filter((i) => Number(i.returnQty) > 0)
      .map((i) => ({
        medicine: i.medicine,
        quantity: Number(i.returnQty),
        price: i.price,
        total: Number(i.returnQty) * i.price,
      }));

    if (!itemsToReturn.length) return toast.error("No return quantity added");

    try {
      if (editingReturnId) {
        // ===== UPDATE EXISTING RETURN =====
        await api.put(`/sales-return/${editingReturnId}`, {
          items: itemsToReturn,
          totalAmount: total,
        });
        toast.success("Sales Return Updated ✅");
      } else {
        // ===== CREATE NEW RETURN =====
        await api.post("/sales-return", {
          originalSaleId: saleData._id,
          customerId: saleData.customerId?._id,
          items: itemsToReturn,
          totalAmount: total,
        });
        toast.success("Sales Return Successful ✅");
      }

      // reset form
      setInvoiceSearch("");
      setSaleData(null);
      setReturnItems([]);
      setTotal(0);
      setEditingReturnId(null);
      loadReturns();
    } catch (err) {
      console.error(err);
      toast.error("Return Failed ❌");
    }
  };

  // ===== DELETE RETURN =====
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this return?")) return;

    try {
      await api.delete(`/sales-return/${id}`);
      toast.success("Deleted successfully");
      loadReturns();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ===== EDIT RETURN =====
  const handleEdit = async (ret) => {
    try {
      // fetch original sale to get max qty
      const res = await api.get("/sales");
      const originalSale = res.data.find((s) => s._id === ret.originalSaleId._id);
      if (!originalSale) return toast.error("Original Sale not found");

      setSaleData(originalSale);
      setReturnItems(
        ret.items.map((i) => {
          const saleItem = originalSale.items.find(s => s.medicine === i.medicine);
          return {
            ...i,
            quantity: saleItem ? saleItem.quantity : 0,
            returnQty: i.quantity,
            total: i.total,
          };
        })
      );
      setTotal(ret.totalAmount);
      setEditingReturnId(ret._id);
      setInvoiceSearch(originalSale.invoiceNo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Edit failed");
    }
  };

  // ===== PAGINATION =====
  const totalPages = Math.ceil(returns.length / limit);
  const startIndex = (page - 1) * limit;
  const currentData = returns.slice(startIndex, startIndex + limit);

  return (
    <div className="container mt-4">
      <h3>↩️ Sales Return</h3>

      {/* SEARCH SALE */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Invoice No"
          value={invoiceSearch}
          onChange={(e) => setInvoiceSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* SALE DATA */}
      {saleData && (
        <>
          <h5>Customer: {saleData.customerId?.name || "Cash"}</h5>

          <table className="table table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>Medicine</th>
                <th>Sold Qty</th>
                <th>Price</th>
                <th>Return Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.medicine}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.returnQty}
                      min={0}
                      max={item.quantity}
                      onChange={(e) => updateQty(idx, e.target.value)}
                    />
                  </td>
                  <td>{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end mb-4">
            <h4>Total Return: ৳ {total}</h4>
            <button className="btn btn-success" onClick={handleSave}>
              {editingReturnId ? "Update Return" : "Confirm Return"}
            </button>
          </div>
        </>
      )}

      {/* RETURN LIST */}
      <h4>Sales Return List</h4>
      <table className="table table-striped table-bordered text-center">
        <thead className="table-dark">
          <tr>
            <th>Return Invoice</th>
            <th>Customer</th>
            <th>Original Invoice</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((ret) => (
            <tr key={ret._id}>
              <td>{ret.returnInvoiceNo}</td>
              <td>{ret.customerId?.name || "Cash"}</td>
              <td>{ret.originalSaleId?.invoiceNo}</td>
              <td>৳ {ret.totalAmount}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-1"
                  onClick={() => handleEdit(ret)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(ret._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center gap-2 mt-3">
        <button
          className="btn btn-outline-primary btn-sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        <span className="align-self-center">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-outline-primary btn-sm"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SalesReturn;