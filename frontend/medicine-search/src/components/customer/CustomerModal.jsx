import { useState } from "react";
import { createCustomer } from "../../api/customerApi";
import { toast } from "react-toastify";
import "./CustomerModal.css";
const CustomerModal = ({ close, reload }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    customerType: "REGULAR",
    openingBalance: 0,
    status: "ACTIVE",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createCustomer(form);
      toast.success("Customer added successfully");
      reload();
      close();
    } catch {
      toast.error("Customer creation failed");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Add Customer</h3>
          <button onClick={close}>✕</button>
        </div>

        <form onSubmit={submit}>
          <input
            name="name"
            placeholder="Customer Name"
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            required
          />
          <input
            name="address"
            placeholder="Address"
            onChange={handleChange}
          />

          <select name="customerType" onChange={handleChange}>
            <option value="REGULAR">Regular</option>
            <option value="CREDIT">Credit</option>
          </select>

          {form.customerType === "CREDIT" && (
            <input
              name="openingBalance"
              type="number"
              placeholder="Opening Balance"
              onChange={handleChange}
            />
          )}

          <select name="status" onChange={handleChange}>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <button type="submit" className="btn btn-success">
            Save Customer
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;