import { defineStore } from "pinia";
import api from "../api/axios";

export const usePostsStore = defineStore("posts", {
  state: () => ({
    feed: [],
    activePost: null,
    comments: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchFeed() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get("/posts");
        this.feed = res.data.posts;
      } catch (err) {
        this.error = err?.response?.data?.error || "Failed to load posts";
      } finally {
        this.loading = false;
      }
    },

    async fetchPost(id) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get(`/posts/${id}`);
        this.activePost = res.data.post;
        this.comments = res.data.comments;
      } catch (err) {
        this.error = err?.response?.data?.error || "Failed to load post";
      } finally {
        this.loading = false;
      }
    },

    async createPost(payload) {
      this.error = null;
      try {
        const res = await api.post("/posts", payload);
    
        // Instant UI update
        const created = res.data.post;
        if (created?._id) {
          this.feed = [created, ...this.feed];
        }
    
        return { ok: true, post: created };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to create post";
        this.error = msg;
        return { ok: false, error: msg };
      }
    },

    async updatePost(id, payload) {
      this.error = null;
      try {
        const res = await api.put(`/posts/${id}`, payload);
        return { ok: true, post: res.data.post };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to update post";
        this.error = msg;
        return { ok: false, error: msg };
      }
    },

    async deletePost(id) {
      this.error = null;
      try {
        await api.delete(`/posts/${id}`);
        return { ok: true };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to delete post";
        this.error = msg;
        return { ok: false, error: msg };
      }
    },

    async addComment(payload) {
      this.error = null;
      try {
        const res = await api.post("/comments", payload);
        return { ok: true, comment: res.data.comment };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to add comment";
        this.error = msg;
        return { ok: false, error: msg };
      }
    },

    async adminDeleteComment(commentId) {
      this.error = null;
      try {
        await api.delete(`/comments/${commentId}`);
        return { ok: true };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to delete comment";
        this.error = msg;
        return { ok: false, error: msg };
      }
    }
  }
});