import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rv_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthCall =
        url.includes("/user/signin") || url.includes("/user/signup");
      const path = window.location.pathname;
      if (
        !isAuthCall &&
        !path.startsWith("/login") &&
        !path.startsWith("/signup")
      ) {
        localStorage.removeItem("rv_token");
        localStorage.removeItem("rv_user");
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (payload) => api.post("/user/signup", payload),
  signin: (payload) => api.post("/user/signin", payload),
  me: () => api.get("/user/me"),
};

export const roomApi = {
  list: () => api.get("/room"),
  get: (id) => api.get(`/room/${id}`),
  create: (payload) => api.post("/room", payload),
  update: (id, payload) => api.put(`/room/${id}`, payload),
  remove: (id) => api.delete(`/room/${id}`),
};
