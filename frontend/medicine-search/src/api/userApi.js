import { getToken } from "../utils/token.util";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

// ========================
// CHANGE CURRENT USER CREDENTIALS
// ========================
export const changeCredentials = async (data) => {
  const res = await fetch(`${baseUrl}/user/change-credentials`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }

  return res.json();
};

// ========================
// EMPLOYEE MANAGEMENT APIs
// ========================

// Get all employees (for super admin)
export const getEmployees = async () => {
  const res = await fetch(`${baseUrl}/user/employees`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    let errMsg = "Failed to fetch employees";
    try {
      const err = await res.json();
      if (err?.message) errMsg = err.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
};

// Create new employee
export const createEmployee = async (data) => {
  const res = await fetch(`${baseUrl}/user/employees`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    let errMsg = "Failed to create employee";
    try {
      const err = await res.json();
      if (err?.message) errMsg = err.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
};

// Block or unblock employee
export const blockUnblockEmployee = async (employeeId, block) => {
  const res = await fetch(`${baseUrl}/user/employees/${employeeId}/block`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ block })
  });
  if (!res.ok) {
    let errMsg = "Failed to update block status";
    try {
      const err = await res.json();
      if (err?.message) errMsg = err.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
};

// Update employee info (name / password / role)
export const updateEmployee = async (employeeId, data) => {
  const res = await fetch(`${baseUrl}/user/employees/${employeeId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    let errMsg = "Failed to update employee";
    try {
      const err = await res.json();
      if (err?.message) errMsg = err.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
};