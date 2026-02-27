import { defineStore } from "pinia";
import api from "../api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    status: "idle",
    error: null
  }),
  getters: {
    isAuthed: (s) => !!s.token,
    isAdmin: (s) => !!s.user?.isAdmin
  },
  actions: {
    async bootstrap() {
      if (!this.token) return;
      try {
        const { data } = await api.get("/api/auth/me");
        this.user = data.user;
        this.error = null;
      } catch (e) {
        this.logout();
      }
    },
    async login(payload) {
      this.status = "loading";
      this.error = null;
      try {
        const { data } = await api.post("/api/auth/login", payload);
        this.token = data.token;
        localStorage.setItem("token", data.token);
        this.user = data.user;
        this.status = "success";
        return true;
      } catch (e) {
        this.status = "error";
        this.error = e?.response?.data?.message || e.message;
        return false;
      }
    },
    async register(payload) {
      this.status = "loading";
      this.error = null;
      try {
        const { data } = await api.post("/api/auth/register", payload);
        this.token = data.token;
        localStorage.setItem("token", data.token);
        this.user = data.user;
        this.status = "success";
        return true;
      } catch (e) {
        this.status = "error";
        this.error = e?.response?.data?.message || e.message;
        return false;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      this.status = "idle";
      this.error = null;
      localStorage.removeItem("token");
    }
  }
});
