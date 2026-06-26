import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  if (!apiUrl && import.meta.env.PROD) {
    throw new Error("Falta configurar VITE_API_URL en Vercel para conectar con el backend");
  }

  const token = localStorage.getItem("agrotrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("agrotrack_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

