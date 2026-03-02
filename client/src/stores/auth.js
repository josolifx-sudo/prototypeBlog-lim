import { defineStore } from "pinia";
import api from "../api/axios";
import axios from "axios";

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
      } catch {
        this.logout();
      }
    },

    async addPhoto(url) {
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

    // 🔥 Cloudinary upload
    async uploadPhotoFile(file) {
      try {
        if (!file) return { ok: false, error: "No file selected" };

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !preset) {
          return { ok: false, error: "Missing Cloudinary env variables" };
        }

        const count = (this.user?.photos || []).length;
        if (count >= 5) {
          return { ok: false, error: "Maximum of 5 photos only" };
        }

        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", preset);

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const res = await axios.post(url, form);

        const secureUrl = res.data.secure_url;
        if (!secureUrl) {
          return { ok: false, error: "Upload failed" };
        }

        const saved = await this.addPhoto(secureUrl);
        if (!saved.ok) return saved;

        return { ok: true, url: secureUrl };

      } catch (err) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.error ||
          "Cloudinary upload failed";

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