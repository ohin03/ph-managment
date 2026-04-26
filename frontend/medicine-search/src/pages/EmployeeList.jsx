import React, { useEffect, useState } from "react";
import { getEmployees, blockUnblockEmployee } from "../api/userApi";
import EmployeeForm from "./EmployeeForm";
import { toast } from "react-toastify";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res);
    } catch (err) {
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleBlockToggle = async (emp) => {
    try {
      await blockUnblockEmployee(emp._id, !emp.blocked);
      toast.success(emp.blocked ? "Unblocked!" : "Blocked!");
      loadEmployees();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Employees</h3>
        <button className="btn btn-success" onClick={handleCreate}>
          + New Employee
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th style={{ minWidth: "180px", maxWidth: "250px" }}>Menus</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-3">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.username}</td>
                  <td>
                    <span
                      className={`badge ${
                        emp.role === "ADMIN" ? "bg-primary" : "bg-secondary"
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td>
                    {emp.menuAccess && emp.menuAccess.length > 0 ? (
                      <div
                        className="d-flex flex-wrap gap-1"
                        style={{
                          maxHeight: "60px",
                          overflowY: "auto",
                        }}
                      >
                        {emp.menuAccess.map((menu, idx) => (
                          <span
                            key={idx}
                            className="badge bg-info text-dark text-truncate"
                            style={{ maxWidth: "100px" }}
                            title={menu}
                          >
                            {menu}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">No access</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleEdit(emp)}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm ${
                        emp.blocked ? "btn-success" : "btn-danger"
                      }`}
                      onClick={() => handleBlockToggle(emp)}
                    >
                      {emp.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Employee Modal */}
      {modalOpen && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => {
            setModalOpen(false);
            loadEmployees();
          }}
        />
      )}
    </div>
  );
};

export default EmployeeList;