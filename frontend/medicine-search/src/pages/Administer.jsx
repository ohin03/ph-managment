import React, { useEffect, useState } from "react";
import { getEmployees, blockUnblockEmployee } from "../api/userApi";
import EmployeeModal from "../components/EmployeeModal";
import { toast } from "react-toastify";

const Administer = () => {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const loadEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res);
  };

  useEffect(() => { loadEmployees(); }, []);

  const handleBlockToggle = async (id, blocked) => {
    await blockUnblockEmployee(id, !blocked);
    toast.success(`Employee ${!blocked ? "Blocked" : "Unblocked"}`);
    loadEmployees();
  };

  return (
    <div className="administer-wrapper">
      <h3>Employees</h3>
      <button className="btn btn-primary mb-2" onClick={() => { setEditEmployee(null); setModalOpen(true); }}>
        Add New Employee
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.role}</td>
              <td>{emp.blocked ? "Blocked" : "Active"}</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" onClick={() => { setEditEmployee(emp); setModalOpen(true); }}>
                  Edit
                </button>
                <button className={`btn btn-sm ${emp.blocked ? "btn-success" : "btn-warning"}`} onClick={() => handleBlockToggle(emp._id, emp.blocked)}>
                  {emp.blocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && <EmployeeModal employee={editEmployee} onClose={() => { setModalOpen(false); loadEmployees(); }} />}
    </div>
  );
};

export default Administer;
