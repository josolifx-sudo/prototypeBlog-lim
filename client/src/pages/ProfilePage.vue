<template>
    <div class="glass box">
      <div class="title">Profile</div>
      <div class="muted">Your account details</div>
  
      <div v-if="auth.user" class="grid">
        <div class="row">
          <div class="label">Username</div>
          <div class="value">{{ auth.user.username }}</div>
        </div>
  
        <div class="row">
          <div class="label">Email</div>
          <div class="value">{{ auth.user.email }}</div>
        </div>
  
        <div class="row">
          <div class="label">Role</div>
          <div class="value">{{ auth.user.isAdmin ? "Admin" : "User" }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted } from "vue";
  import { useAuthStore } from "../stores/auth";
  
  export default {
    name: "ProfilePage",
    setup() {
      const auth = useAuthStore();
      onMounted(async () => {
        if (auth.token && !auth.user) await auth.fetchMe();
      });
      return { auth };
    }
  };
  </script>
  
  <style scoped>
  .box { padding: 16px; border-radius: var(--radius); }
  .title { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
  .grid { margin-top: 14px; display: grid; gap: 10px; }
  .row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: rgba(0,0,0,0.18);
  }
  .label { font-weight: 850; color: var(--muted); }
  .value { font-weight: 750; }
  </style>