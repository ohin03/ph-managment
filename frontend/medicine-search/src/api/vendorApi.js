import axiosInstance from "./axiosInstance";

// Get vendors (with search & pagination)
export const getVendors = (q = "", page = 1, limit = 10) => {
  return axiosInstance
    .get(`/vendors?q=${q}&page=${page}&limit=${limit}`)
    .then((res) => res.data);
};

// Create vendor
export const createVendor = (data) => {
  return axiosInstance
    .post("/vendors", data)
    .then((res) => res.data);
};

// Update vendor
export const updateVendor = (id, data) => {
  return axiosInstance
    .put(`/vendors/${id}`, data)
    .then((res) => res.data);
};

// Delete vendor
export const deleteVendor = (id) => {
  return axiosInstance
    .delete(`/vendors/${id}`)
    .then((res) => res.data);
};