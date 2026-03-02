import { defineStore } from "pinia";
import api from "../api/axios";

export const usePostsStore = defineStore("posts", {
  state: () => ({
    feed: [],
    page: 1,
    limit: 8,
    hasMore: true,
    loading: false,
    loadingMore: false,
    error: null,

    currentPost: null,
    comments: [],

    trending: { topLiked: [], mostCommented: [] },
    trendingLoading: false
  }),

  actions: {
    resetFeed() {
      this.feed = [];
      this.page = 1;
      this.hasMore = true;
      this.error = null;
    },

    async fetchFeedFirstPage() {
      this.loading = true;
      this.error = null;
      this.resetFeed();

      try {
        const res = await api.get(`/posts?page=1&limit=${this.limit}`);
        this.feed = res.data.posts || [];
        this.page = 1;
        this.hasMore = !!res.data.hasMore;
      } catch (err) {
        this.error = err?.response?.data?.error || "Failed to load feed";
      } finally {
        this.loading = false;
      }
    },

    async fetchMore() {
      if (this.loadingMore || !this.hasMore) return;

      this.loadingMore = true;
      this.error = null;

      try {
        const nextPage = this.page + 1;
        const res = await api.get(`/posts?page=${nextPage}&limit=${this.limit}`);

        const nextPosts = res.data.posts || [];
        this.feed = [...this.feed, ...nextPosts];
        this.page = nextPage;
        this.hasMore = !!res.data.hasMore;
      } catch (err) {
        this.error = err?.response?.data?.error || "Failed to load more posts";
      } finally {
        this.loadingMore = false;
      }
    },

    async fetchTrending() {
      this.trendingLoading = true;
      try {
        const res = await api.get("/posts/trending");
        this.trending = res.data;
      } catch {
        this.trending = { topLiked: [], mostCommented: [] };
      } finally {
        this.trendingLoading = false;
      }
    },

    async fetchPost(id) {
      this.error = null;
      this.currentPost = null;
      this.comments = [];

      try {
        const res = await api.get(`/posts/${id}`);
        this.currentPost = res.data.post;
        this.comments = res.data.comments || [];
      } catch (err) {
        this.error = err?.response?.data?.error || "Failed to load post";
      }
    },

    async createPost(payload) {
      this.error = null;
      try {
        const res = await api.post("/posts", payload);
        return { ok: true, post: res.data.post };
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to create post";
        this.error = msg;
        return { ok: false, error: msg };
      }
    },

    async toggleLike(postId) {
      this.error = null;

      const idx = this.feed.findIndex((p) => p._id === postId);
      const prev = idx >= 0 ? { ...this.feed[idx] } : null;

      if (idx >= 0) {
        const p = { ...this.feed[idx] };
        const liked = !!p.likedByMe;
        p.likedByMe = !liked;
        p.likeCount = Math.max(0, (p.likeCount || 0) + (liked ? -1 : 1));
        this.feed.splice(idx, 1, p);
      }

      try {
        const res = await api.post(`/posts/${postId}/like`);
        const updated = res.data.post;

        const idx2 = this.feed.findIndex((p) => p._id === postId);
        if (idx2 >= 0) this.feed.splice(idx2, 1, updated);

        if (this.currentPost?._id === postId) this.currentPost = updated;

        return { ok: true };
      } catch (err) {
        if (idx >= 0 && prev) this.feed.splice(idx, 1, prev);
        const msg = err?.response?.data?.error || "Failed to react";
        this.error = msg;
        return { ok: false, error: msg };
      }
    }
  }
});