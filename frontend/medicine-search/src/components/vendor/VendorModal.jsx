import { useState, useEffect } from "react";
import { createVendor, updateVendor } from "../../api/vendorApi";
import { toast } from "react-toastify";
import "./VendorModal.css";

const VendorModal = ({ vendor, close, reload }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    company: "",
    openingBalance: "", // 👈 empty string (IMPORTANT)
  });

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name || "",
        phone: vendor.phone || "",
        company: vendor.company || "",
        openingBalance:
          vendor.currentBalance !== undefined
            ? String(vendor.currentBalance)
            : "",
      });
    } else {
      // add mode reset
      setForm({
        name: "",
        phone: "",
        company: "",
        openingBalance: "",
      });
    }
  }, [vendor]);

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        openingBalance: Number(form.openingBalance || 0), // 👈 convert here
      };

      if (vendor) {
        await updateVendor(vendor._id, payload);
        toast.success("Vendor Updated");
      } else {
        await createVendor(payload);
        toast.success("Vendor Added");
      }

      close();
      reload();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content vendor-modal">
        <h4 className="mb-3">
          {vendor ? "Edit Vendor" : "Add Vendor"}
        </h4>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Company"
          value={form.company}
          onChange={(e) =>
            setForm({ ...form, company: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Opening Balance"
          value={form.openingBalance}
          onChange={(e) =>
            setForm({ ...form, openingBalance: e.target.value })
          }
        />

        <div className="modal-actions mt-3">
          <button
            className="btn btn-success me-2"
            onClick={handleSubmit}
          >
            {vendor ? "Update" : "Save"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={close}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;
