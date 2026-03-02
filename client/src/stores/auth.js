import { defineStore } from "pinia";
import api from "../api/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => !!s.user?.isAdmin
  },
  actions: {
    normalizeUser(u) {
      if (!u) return null;
      return {
        id: u._id || u.id,
        email: u.email,
        username: u.username,
        isAdmin: !!u.isAdmin,
        avatarUrl: u.avatarUrl || "",
        photos: Array.isArray(u.photos) ? u.photos : []
      };
    },

    async register(payload) {
      this.loading = true;
      this.error = null;
      try {
        await api.post("/auth/register", payload);
        return { ok: true };
      } catch (err) {
        this.error = err?.response?.data?.error || "Register failed";
        return { ok: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async login(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/login", payload);
        this.token = res.data.token;
        localStorage.setItem("token", this.token);
        this.user = this.normalizeUser(res.data.user);
        return { ok: true };
      } catch (err) {
        this.error = err?.response?.data?.error || "Login failed";
        return { ok: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (!this.token) return;
      try {
        const res = await api.get("/auth/me");
        this.user = this.normalizeUser(res.data.user);
      } catch (err) {
        this.logout();
      }
    },

    async addPhoto(url) {
      this.error = null;
      try {
        const res = await api.put("/auth/photos", { url });
        this.user = this.normalizeUser(res.data.user);
        return { ok: true };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to add photo";
        this.error = msg;
        return { ok: false, error: msg };
      }
    },

    async removePhoto(url) {
      this.error = null;
      try {
        const res = await api.delete("/auth/photos", { data: { url } });
        this.user = this.normalizeUser(res.data.user);
        return { ok: true };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to remove photo";
        this.error = msg;
        return { ok: false, error: msg };
      }
    },

    async setAvatar(url) {
      this.error = null;
      try {
        const res = await api.put("/auth/avatar", { url });
        this.user = this.normalizeUser(res.data.user);
        return { ok: true };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to set avatar";
        this.error = msg;
        return { ok: false, error: msg };
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
    }
  }
});