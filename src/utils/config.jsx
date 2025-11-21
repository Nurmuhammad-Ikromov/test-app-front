import axios from "axios";

const API = axios.create({
  // baseURL: "https://test-app-d1ps.onrender.com"
  baseURL: "https://test-pdp-backend.onrender.com",
  // baseURL: "http://localhost:3000",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
