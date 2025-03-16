import axios from "axios";

const API_URL = import.meta.env.VITE_LOCAL_API_URL; //development
//const API_URL = import.meta.env.VITE_PROD_API_URL; //production

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
