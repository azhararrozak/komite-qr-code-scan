import { create } from "zustand";
import axios from "axios";
import api from "../services/api";

const API_URL = "http://localhost:3000/api/auth/";

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(API_URL + "signin", { username, password });
      const data = res.data;
      if (data && data.accessToken) {
        get().setUser(data);
      }
      set({ loading: false });
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      set({ error: message, loading: false });
      throw err;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(API_URL + "signup", {
        username,
        email,
        password,
      });
      set({ loading: false });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      set({ error: message, loading: false });
      throw err;
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/user/profile");
      set({ loading: false });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      set({ error: message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));

export default useAuthStore;
