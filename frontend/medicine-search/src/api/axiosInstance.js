import axios from "axios";
import { getToken, removeToken } from "../utils/token.util";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Request interceptor → token attach
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response interceptor → token expire handle
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // token invalid / expired
      removeToken(); // localStorage / cookie clear

      // optional: toast দেখাতে চাইলে এখানে দিতে পারো
      // toast.error("Session expired. Please login again");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
