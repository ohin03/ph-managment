// src/pages/SalesEntry.jsx
import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./SalesEntry.css";

const SalesEntry = () => {
  // ===== DATE & TIME =====
  const getBangladeshNow = () =>
    new Date().toISOString();

  // ===== STATE =====
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now()}`);
  const [saleDate, setSaleDate] = useState(getBangladeshNow());

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);

  const [total, setTotal] = useState(0);
  const [netTotal, setNetTotal] = useState(0);
  const [due, setDue] = useState(0);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editSaleId, setEditSaleId] = useState(null);

  const [salesList, setSalesList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // ===== FETCH CUSTOMERS =====
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        setCustomers(res.data);
      } catch {
        toast.error("Failed to load customers");
      }
    };
    fetchCustomers();
  }, []);

  // ===== FETCH SALES LIST =====
  const fetchSalesList = async () => {
    try {
      const res = await api.get("/sales");
      const sorted = res.data.sort(
        (a, b) => new Date(b.saleDate) - new Date(a.saleDate)
      );
      setSalesList(sorted);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchSalesList();
  }, []);

  // ===== SEARCH ITEMS DEBOUNCE =====
  useEffect(() => {
    if (!search.trim()) return setSearchResults([]);
    const delay = setTimeout(async () => {
      try {
        // Use medicine master search so newly created medicines from PurchaseEntry appear immediately
        const res = await api.get(`/medicines/search?q=${encodeURIComponent(search)}`);
        setSearchResults(res.data);
        setSelectedIndex(-1);
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  // ===== KEYBOARD NAV =====
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown")
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    else if (e.key === "ArrowUp")
      setSelectedIndex((prev) => Math.max(prev - 0, 0));
    else if (e.key === "Enter" && searchResults[selectedIndex])
      addToCart(searchResults[selectedIndex]);
  };

  // ===== ADD TO CART =====
  const addToCart = (item) => {
    const exists = cart.find((i) => i._id === item._id);
    if (exists) return toast.info("Already added!");
    const salePrice = item.salesPrice !== undefined && item.salesPrice !== null && item.salesPrice !== ""
      ? Number(item.salesPrice)
      : Number(item.purchasePrice || 0);

    setCart([
      ...cart,
      {
        ...item,
        name: item.name || item.item_name,
        genericName: item.genericName || item.generic_name || "",
        quantity: 1,
        price: salePrice,
        total: salePrice,
      },
    ]);
    setSearch("");
    setSearchResults([]);
    setSelectedIndex(-1);

    // Low Stock Alert
    if (item.stock <= 5) toast.warning(`Low Stock Alert: ${item.name} 📦`);
  };

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateCart = (index, field, value) => {
    const newCart = [...cart];
    newCart[index][field] = value;
    const qty = Number(newCart[index].quantity || 0);
    const price = Number(newCart[index].price || 0);
    newCart[index].total = qty * price;
    setCart(newCart);
  };

  // ===== CALCULATIONS =====
  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + Number(item.total || 0), 0);
    setTotal(sum);
    const disc = Number(discount || 0);
    const afterDiscount = sum - disc;
    setNetTotal(afterDiscount);
    setDue(afterDiscount - Number(paid || 0));
  }, [cart, discount, paid]);

  // ===== SAVE / UPDATE SALE =====
  const handleSave = async () => {
    if (!cart.length) return toast.error("Cart is empty!");
    const now = getBangladeshNow(); // Save current BD time
    const payload = {
      invoiceNo,
      saleDate: now,
      customerId: customerId || null,
      discount: Number(discount || 0),
      items: cart.map((i) => ({
        medicine: i.name,
        quantity: Number(i.quantity),
        price: Number(i.price),
        total: Number(i.total),
        _id: i._id,
      })),
      totalAmount: total,
      totalPaid: Number(paid),
      totalDue: Number(due),
    };

    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/sales/${editSaleId}`, payload);
        toast.success("Sale Updated Successfully ✅");
        setSalesList((prev) =>
          prev.map((s) => (s._id === editSaleId ? res.data : s))
        );
      } else {
        res = await api.post("/sales", payload);
        toast.success("Sale Saved Successfully ✅");
        const newSale = {
          _id: res.data._id,
          invoiceNo,
          saleDate: now,
          customerId: { name: customers.find((c) => c._id === customerId)?.name || "Cash Customer" },
          items: res.data.items,
          discount: Number(discount || 0),
          totalAmount: total,
          totalPaid: Number(paid),
          totalDue: Number(due),
        };
        setSalesList((prev) => [newSale, ...prev]);
      }

      handleReset();
      setIsEditMode(false);
      setEditSaleId(null);
    } catch {
      toast.error(isEditMode ? "Update Failed ❌" : "Sale Failed ❌");
    }
  };

  // ===== DELETE SALE =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;
    try {
      await api.delete(`/sales/${id}`);
      toast.success("Sale Deleted ✅");
      setSalesList((prev) => prev.filter((s) => s._id !== id));
    } catch {
      toast.error("Delete Failed ❌");
    }
  };

  // ===== EDIT SALE =====
  const handleEditSale = (sale) => {
    setIsEditMode(true);
    setEditSaleId(sale._id);
    setInvoiceNo(sale.invoiceNo);
    if (sale.customerId && !customers.find(c => c._id === sale.customerId._id)) {
      setCustomers(prev => [...prev, sale.customerId]);
    }
    setCustomerId(sale.customerId?._id || "");
    setCart(
      sale.items.map((i) => ({
        ...i,
        name: i.medicine,
        quantity: i.quantity,
        price: i.price, // salesPrice
        total: i.total,
      }))
    );
    setDiscount(Number(sale.discount || 0)); // ✅ discount fix
    setPaid(Number(sale.totalPaid || 0));
  };

  // ===== RESET FORM =====
  const handleReset = () => {
    setInvoiceNo(`INV-${Date.now()}`);
    setCustomerId("");
    setCart([]);
    setSearch("");
    setSearchResults([]);
    setSelectedIndex(-1);
    setDiscount(0);
    setPaid(0);
    setIsEditMode(false);
    setEditSaleId(null);
  };

  // ===== PRINT =====
  const handlePrint = () => window.print();

  // ===== SUMMARY =====
  const summary = useMemo(() => {
    const todayDate = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Dhaka" });
    const currentMonth = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const monthIndex = new Date(currentMonth).getMonth();
    const year = new Date(currentMonth).getFullYear();

    let todaySale = 0, todayDue = 0, monthSale = 0, monthDue = 0;
    salesList.forEach((sale) => {
      const saleLocalDate = new Date(sale.saleDate).toLocaleDateString("en-US", { timeZone: "Asia/Dhaka" });
      const saleLocalMonth = new Date(sale.saleDate).toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
      const saleMonth = new Date(saleLocalMonth).getMonth();
      const saleYear = new Date(saleLocalMonth).getFullYear();

      if (saleLocalDate === todayDate) {
        todaySale += Number(sale.totalAmount || 0);
        todayDue += Number(sale.totalDue || 0);
      }
      if (saleMonth === monthIndex && saleYear === year) {
        monthSale += Number(sale.totalAmount || 0);
        monthDue += Number(sale.totalDue || 0);
      }
    });
    return { todaySale, todayDue, monthSale, monthDue };
  }, [salesList]);

  // ===== PAGINATION =====
  const filteredSales = salesList.filter((s) => {
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      String(s.invoiceNo || "").toLowerCase().includes(q) ||
      String(s.customerId?.name || "Cash Customer").toLowerCase().includes(q)
    );
  });
  const totalPages = Math.ceil(filteredSales.length / limit);
  const paginatedSales = filteredSales.slice((page - 1) * limit, page * limit);

  return (
    <div className="container my-4">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* ===== SALES ENTRY FORM ===== */}
      <div className="card shadow-lg mb-4 print-only-form">
        <div className="card-header bg-success text-white d-flex justify-content-between">
          <h4>🧾 Sales Entry</h4>
          <span>{invoiceNo}</span>
        </div>
        <div className="card-body">
          {/* CUSTOMER */}
          <div className="row mb-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Walk In Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ITEM SEARCH */}
          <div className="mb-3 position-relative">
            <input
              className="form-control"
              placeholder="Search Medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchResults.length > 0 && (
              <ul className="list-group position-absolute w-100 z-3">
                {searchResults.map((item, idx) => (
                  <li
                    key={item._id}
                    className={`list-group-item list-group-item-action ${idx === selectedIndex ? "bg-secondary text-white" : ""}`}
                    onClick={() => addToCart(item)}
                  >
                    {(item.name || item.item_name)} ({item.genericName || item.generic_name || "N/A"}) | Stock: {Number(item.stock || 0)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CART */}
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead className="table-dark">
                <tr>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                    {item.name}
                    {item.genericName || item.generic_name ? (
                      <div className="text-muted small">{item.genericName || item.generic_name}</div>
                    ) : null}
                  </td>
                    <td><input type="number" className="form-control" value={item.quantity} onChange={(e) => updateCart(idx, "quantity", e.target.value)} /></td>
                    <td><input type="number" className="form-control" value={item.price} onChange={(e) => updateCart(idx, "price", e.target.value)} /></td>
                    <td>{item.total}</td>
                    <td>
                      <button className="btn btn-danger btn-sm me-1" onClick={() => removeItem(idx)}>X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUMMARY */}
          <div className="row mt-4">
           <div className="col-md-3">
  <label htmlFor="discountInput">Discount:</label>
  <input
    type="number"
    className="form-control"
    placeholder="Discount"
    value={discount}
    onChange={(e) => setDiscount(e.target.value)} // string হিসেবে রাখুন
  />
</div>

<div className="col-md-3">
  <label htmlFor="paidInput">Paid Amount:</label>
  <input
    type="number"
    className="form-control"
    placeholder="Paid Amount"
    value={paid}
    onChange={(e) => setPaid(e.target.value)}
  />
</div>
            <div className="col-md-6 text-end">
              <h6>Total: {total}</h6>
              <h5>Net: {netTotal}</h5>
              <h5 className={due > 0 ? "text-danger" : "text-success"}>{due > 0 ? `Due: ${due}` : `Return: ${-due}`}</h5>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-4 text-end">
            <button className="btn btn-success me-2" onClick={handleSave}>{isEditMode ? "Update" : "Save"}</button>
            <button className="btn btn-primary me-2" onClick={handlePrint}>Print</button>
            <button className="btn btn-warning me-2" onClick={() => toast.info("Draft/Hold saved!")}>Draft/Hold</button>
            <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      {/* SALES LIST */}
      <div className="card shadow-sm print-hide">
        <div className="card-header bg-secondary text-white"><h4>Sales List</h4></div>
        <div className="card-body table-responsive">
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Search by invoice/customer..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <table className="table table-striped table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>Invoice</th>
                <th>Date & Time (BD)</th>
                <th>Customer</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.map((s) => (
                <tr key={s._id}>
                  <td>{s.invoiceNo}</td>
                  <td>
                    {new Date(s.saleDate).toLocaleString("en-US", {
                      timeZone: "Asia/Dhaka",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td>{s.customerId?.name || "Walk In Customer"}</td>
                  <td>{Number(s.discount || 0)}</td>
                  <td>{s.totalAmount}</td>
                  <td>{s.totalPaid}</td>
                  <td>{s.totalDue}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleEditSale(s)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-sm btn-primary" disabled={page === 1} onClick={() => setPage(p => p-1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button className="btn btn-sm btn-primary" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>Next</button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row mt-4 print-hide">
        <div className="col-md-3"><div className="card bg-success text-white shadow text-center"><div className="card-body"><h6>Today Sale</h6><h4>৳ {summary.todaySale}</h4></div></div></div>
        <div className="col-md-3"><div className="card bg-danger text-white shadow text-center"><div className="card-body"><h6>Today Due</h6><h4>৳ {summary.todayDue}</h4></div></div></div>
        <div className="col-md-3"><div className="card bg-primary text-white shadow text-center"><div className="card-body"><h6>This Month Sale</h6><h4>৳ {summary.monthSale}</h4></div></div></div>
        <div className="col-md-3"><div className="card bg-warning text-dark shadow text-center"><div className="card-body"><h6>This Month Due</h6><h4>৳ {summary.monthDue}</h4></div></div></div>
      </div>
    </div>
  );
};

export default SalesEntry;
