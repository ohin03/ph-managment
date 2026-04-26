import { getToken } from "../utils/token.util";
const baseUrl = process.env.REACT_APP_API_BASE_URL;

// GET all employees
export const getEmployees = async () => {
  const res = await fetch(`${baseUrl}/employee`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.json();
};

// CREATE employee
export const createEmployee = async (data) => {
  const res = await fetch(`${baseUrl}/employee`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

// UPDATE employee
export const updateEmployee = async (id, data) => {
  const res = await fetch(`${baseUrl}/employee/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

// BLOCK / UNBLOCK employee
export const blockEmployee = async (id, block) => {
  const res = await fetch(`${baseUrl}/employee/block/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ block })
  });
  return res.json();
};
