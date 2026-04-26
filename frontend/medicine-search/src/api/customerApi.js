import axios from "./axiosInstance";

export const getCustomers = () => axios.get("/customers");
export const createCustomer = (data) => axios.post("/customers", data);
export const updateCustomer = (id, data) =>
  axios.put(`/customers/${id}`, data);