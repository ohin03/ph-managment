import { useEffect, useState, useCallback } from "react";
import { getVendors, deleteVendor } from "../api/vendorApi";
import { toast } from "react-toastify";
import VendorModal from "../components/vendor/VendorModal";
import { useNavigate } from "react-router-dom";

/* Simple debounce helper */
const debounce = (fn, delay = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const VendorSetup = () => {
  const [vendors, setVendors] = useState([]); // Only store array now
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // Load vendors with search & pagination
  const loadVendors = useCallback(async (query = "", pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await getVendors(query, pageNumber, 10);
      setVendors(res.data); // store only array
      setTotalPages(res.totalPages || 1);
      setPage(res.page || 1);
    } catch (err) {
      console.error("loadVendors error:", err);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedLoad = useCallback(debounce(loadVendors, 400), [loadVendors]);

  useEffect(() => {
    debouncedLoad(search, 1);
  }, [search, debouncedLoad]);

  // Modal handlers
  const handleAdd = () => {
    setEditVendor(null);
    setModalOpen(true);
  };

  const handleEdit = (vendor) => {
    setEditVendor(vendor);
    setModalOpen(true);
  };

  const handleViewLedger = (vendorId) => {
    navigate(`/vendor-ledger/${vendorId}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      await deleteVendor(id);
      toast.success("Vendor deleted successfully");
      loadVendors(search, page);
    } catch (err) {
      console.error("Delete vendor error:", err);
      toast.error("Failed to delete vendor");
    }
  };

  const handlePrevPage = () => {
    if (page > 1) loadVendors(search, page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) loadVendors(search, page + 1);
  };

  return (
    <div className="page-content">
      <h2>Vendor Setup</h2>

      <div className="d-flex mb-3">
        <input
          className="form-control me-2"
          placeholder="Search vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Vendor
        </button>
      </div>

      {loading ? (
        <p>Loading vendors...</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.company || "-"}</td>
                    <td>৳ {vendor.currentBalance?.toFixed(2) || 0}</td>
                    <td>
                      <span
                        className={`badge ${
                          vendor.status === "ACTIVE"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() => handleEdit(vendor)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-secondary me-1"
                        onClick={() => handleViewLedger(vendor._id)}
                      >
                        Ledger
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(vendor._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={handlePrevPage}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-outline-primary"
              onClick={handleNextPage}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <VendorModal
          vendor={editVendor}
          close={() => setModalOpen(false)}
          reload={() => loadVendors(search, page)}
        />
      )}
    </div>
  );
};

export default VendorSetup;