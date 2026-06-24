import axios from "axios";

const API = axios.create({
  // Production uchun default Render manzili; lokalda sinash uchun
  // .env.local ichida VITE_API_URL=http://localhost:3000 yozing
  baseURL:
    import.meta.env.VITE_API_URL || "https://test-pdp-backend-ao8r.onrender.com",
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
