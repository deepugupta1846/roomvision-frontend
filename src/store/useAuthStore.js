import { create } from "zustand";
import { authApi } from "../api/client";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("rv_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem("rv_token"),
  loading: false,
  error: null,

  setSession: (user, token) => {
    localStorage.setItem("rv_token", token);
    localStorage.setItem("rv_user", JSON.stringify(user));
    set({ user, token, error: null });
  },

  clearSession: () => {
    localStorage.removeItem("rv_token");
    localStorage.removeItem("rv_user");
    set({ user: null, token: null });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.signin({ email, password });
      const { user, token } = data.data || {};
      if (!token || !user) {
        throw new Error("Login succeeded but no token was returned");
      }
      localStorage.setItem("rv_token", token);
      localStorage.setItem("rv_user", JSON.stringify(user));
      set({ user, token, loading: false, error: null });
      return user;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  signup: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.signup({ name, email, password });
      const { user, token } = data.data || {};
      if (!token || !user) {
        throw new Error("Signup succeeded but no token was returned");
      }
      localStorage.setItem("rv_token", token);
      localStorage.setItem("rv_user", JSON.stringify(user));
      set({ user, token, loading: false, error: null });
      return user;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Signup failed";
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem("rv_token");
    localStorage.removeItem("rv_user");
    set({ user: null, token: null, error: null });
  },
}));
