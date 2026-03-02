<template>
    <div class="stack">
      <section class="glass box">
        <div class="title">Admin dashboard</div>
        <div class="muted">You can delete any post and remove any comment</div>
  
        <div class="actions">
          <button class="btn btn-primary" @click="refresh">Refresh</button>
        </div>
      </section>
  
      <section class="glass box">
        <div class="hdr">
          <div class="sub">All posts</div>
          <div class="muted">{{ posts.feed.length }} total</div>
        </div>
  
        <div v-if="posts.loading" class="muted pulse">Loading...</div>
  
        <div v-else class="list">
          <div v-for="p in posts.feed" :key="p._id" class="item">
            <div class="main">
              <div class="row">
                <div class="name">{{ p.title }}</div>
                <div class="muted tiny">{{ formatDate(p.createdAt) }}</div>
              </div>
              <div class="muted">by {{ p.author?.username }}</div>
            </div>
  
            <div class="right">
              <button class="btn btn-ghost" @click="$router.push(`/post/${p._id}`)">Open</button>
              <button class="btn btn-danger" @click="deletePost(p._id)">Delete</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  import { onMounted } from "vue";
  import { useAuthStore } from "../stores/auth";
  import { usePostsStore } from "../stores/posts";
  
  export default {
    name: "AdminDashboardPage",
    setup() {
      const auth = useAuthStore();
      const posts = usePostsStore();
  
      function formatDate(value) {
        const d = value ? new Date(value) : null;
        return d ? d.toLocaleString() : "";
      }
  
      async function refresh() {
        if (auth.token && !auth.user) await auth.fetchMe();
        await posts.fetchFeed();
      }
  
      async function deletePost(id) {
        await posts.deletePost(id);
        await posts.fetchFeed();
      }
  
      onMounted(refresh);
  
      return { auth, posts, refresh, deletePost, formatDate };
    }
  };
  </script>
  
  <style scoped>
  .stack { display: grid; gap: 14px; }
  .box { padding: 16px; border-radius: var(--radius); }
  .title { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
  .actions { margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap; }
  .hdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
  .sub { font-weight: 900; }
  .list { display: grid; gap: 10px; }
  .item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: rgba(0,0,0,0.18);
  }
  .row { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
  .name { font-weight: 900; }
  .right { display: flex; gap: 10px; flex-wrap: wrap; }
  .tiny { font-size: 12px; }
  </style>