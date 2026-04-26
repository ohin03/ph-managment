import React, { useEffect, useState } from "react";
import Select from "react-select";
import { createEmployee, updateEmployee } from "../api/userApi";
import { toast } from "react-toastify";
import "./EmployeeForm.css";

/* ================= MENU STRUCTURE ================= */
const MENU_OPTIONS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "medicines", label: "Medicines" },
  { id: "profile", label: "Profile" },

  /* ================= PURCHASE ================= */
  {
    id: "purchase",
    label: "Purchase",
    children: [
      { id: "purchase-entry", label: "Purchase Entry" },
      { id: "purchase-return", label: "Purchase Return" }
    ]
  },

  /* ================= SALES ================= */
  {
    id: "sales",
    label: "Sales",
    children: [
      { id: "sales-entry", label: "Sales Entry" },
      { id: "sales-return", label: "Sales Return" },
      { id: "vendor-sales", label: "Vendor Sales" }
    ]
  },

  /* ================= TRANSACTION ================= */
  {
    id: "transaction",
    label: "Transaction",
    children: [
      { id: "customer-receive", label: "Customer Receive" },
      { id: "vendor-receive", label: "Vendor Receive" }
    ]
  },

  /* ================= REPORT ================= */
  {
    id: "report",
    label: "Report",
    children: [
      {
        id: "sales-report-group",
        label: "Sales Reports",
        children: [
          { id: "sales-report", label: "Sales Report" },
          { id: "sales-return-report", label: "Sales Return Report" }
        ]
      },

      {
        id: "purchase-report-group",
        label: "Purchase Reports",
        children: [
          { id: "purchase-report", label: "Purchase Report" },
          { id: "purchase-return-report", label: "Purchase Return Report" }
        ]
      },

      {
        id: "transaction-report-group",
        label: "Transaction Reports",
        children: [
          { id: "customer-receive-report", label: "Customer Receive Report" },
          { id: "vendor-receive-report", label: "Vendor Receive Report" }
        ]
      },

      {
        id: "ledger-group",
        label: "Ledger",
        children: [
          { id: "customer-ledger", label: "Customer Ledger" },
          { id: "vendor-ledger", label: "Vendor Ledger" }
        ]
      },

      {
        id: "vendor-report-group",
        label: "Vendor Reports",
        children: [
          { id: "vendor-report", label: "Vendor Report" }
        ]
      },
      /* --- Added Attendance Report Here --- */
      {
        id: "attendance-report-group",
        label: "HR Reports",
        children: [
          { id: "attendance-report", label: "Attendance Report" }
        ]
      },
    ]
  }
];

const roleOptions = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "ADMIN", label: "Admin (Super Admin)" }
];

const EmployeeForm = ({ employee, onClose }) => {
  const isEdit = !!employee;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [password, setPassword] = useState("");
  const [menuAccess, setMenuAccess] = useState([]);

  useEffect(() => {
    if (employee) {
      setName(employee.name || "");
      setEmail(employee.email || "");
      setUsername(employee.username || "");
      setPhone(employee.phone || "");
      setPosition(employee.position || "");
      setSalary(employee.salary != null ? String(employee.salary) : "");
      setRole(employee.role || "EMPLOYEE");
      setMenuAccess(employee.menuAccess || []);
    }
  }, [employee]);

  const getAllChildIds = (children = []) => {
    let ids = [];
    children.forEach(child => {
      ids.push(child.id);
      if (child.children) ids = [...ids, ...getAllChildIds(child.children)];
    });
    return ids;
  };

  const toggleMenu = (menu) => {
    setMenuAccess(prev => {
      let updated = [...prev];
      const exists = updated.includes(menu.id);
      const childIds = menu.children ? getAllChildIds(menu.children) : [];

      if (exists) {
        updated = updated.filter(m => m !== menu.id && !childIds.includes(m));
      } else {
        updated.push(menu.id, ...childIds);
      }

      return [...new Set(updated)];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        name,
        email,
        username,
        phone,
        position,
        salary: Number(salary),
        role,
        menuAccess,
        ...(password ? { password } : {})
      };

      if (isEdit) {
        await updateEmployee(employee._id, data);
        toast.success("Employee updated successfully ✅");
      } else {
        if (!password || password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }

        await createEmployee({ ...data, password });
        toast.success("Employee created successfully ✅");
      }

      onClose();

    } catch (err) {
      toast.error(err.message || "Failed to save employee");
    }
  };

  const renderMenu = (menus, level = 0) => {
    return menus.map(menu => (
      <div key={menu.id} className="ef-menu-item" style={{ marginLeft: level * 20 }}>
        <div className="form-check">
          <input
            className="form-check-input ef-checkbox"
            type="checkbox"
            checked={menuAccess.includes(menu.id)}
            onChange={() => toggleMenu(menu)}
          />
          <label className={`form-check-label ${level === 0 ? "fw-bold" : ""}`}>
            {menu.label}
          </label>
        </div>

        {menu.children && renderMenu(menu.children, level + 1)}
      </div>
    ));
  };

  return (
    <>
      <div className="ef-modal-backdrop show"></div>

      <div className="modal d-block ef-modal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow rounded-3 ef-modal-content">

            <div className="modal-header ef-modal-header bg-primary text-white">
              <h5 className="modal-title">
                {isEdit ? "Edit Employee" : "Create Employee"}
              </h5>

              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body ef-modal-body">
                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control ef-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control ef-input ef-input-large"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control ef-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control ef-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Position</label>
                    <input
                      type="text"
                      className="form-control ef-input"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Salary</label>
                    <input
                      type="number"
                      className="form-control ef-input"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <Select
                      options={roleOptions}
                      value={roleOptions.find(o => o.value === role)}
                      onChange={(selected) => setRole(selected.value)}
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Password {isEdit && <small>(leave blank to keep same)</small>}
                    </label>

                    <input
                      type="password"
                      className="form-control ef-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      {...(!isEdit ? { required: true } : {})}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Sidebar Menu Access</label>

                    <div className="ef-menu-container border rounded p-2">
                      {renderMenu(MENU_OPTIONS)}
                    </div>
                  </div>

                </div>
              </div>

              <div className="modal-footer ef-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                  {isEdit ? "Save Changes" : "Create"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeForm;