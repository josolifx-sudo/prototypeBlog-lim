<template>
    <div class="wrap">
      <div class="glass box">
        <div class="title">Welcome back</div>
        <div class="muted">Login with email or username</div>
  
        <form class="form" @submit.prevent="submit">
          <input class="input" v-model="login" placeholder="Email or username" required />
          <input class="input" v-model="password" type="password" placeholder="Password" required />
  
          <button class="btn btn-primary" :disabled="auth.loading">
            {{ auth.loading ? "Logging in..." : "Login" }}
          </button>
  
          <div v-if="auth.error" class="muted">{{ auth.error }}</div>
  
          <div class="muted">
            No account?
            <router-link to="/register" class="link">Register</router-link>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  import { useAuthStore } from "../stores/auth";
  
  export default {
    name: "LoginPage",
    setup() {
      const auth = useAuthStore();
      const login = ref("");
      const password = ref("");
  
      async function submit() {
        const res = await auth.login({ login: login.value, password: password.value });
        if (res.ok) window.location.href = "/";
      }
  
      return { auth, login, password, submit };
    }
  };
  </script>
  
  <style scoped>
  .wrap { display: grid; place-items: center; min-height: 70vh; }
  .box { width: min(520px, 100%); padding: 16px; border-radius: var(--radius); }
  .title { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
  .form { margin-top: 12px; display: grid; gap: 10px; }
  .link { color: var(--brand); font-weight: 750; }
  </style>