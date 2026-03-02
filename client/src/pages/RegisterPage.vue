<template>
    <div class="wrap">
      <div class="glass box">
        <div class="title">Create your account</div>
        <div class="muted">Email, username, password</div>
  
        <form class="form" @submit.prevent="submit">
          <input class="input" v-model="email" type="email" placeholder="Email" required />
          <input class="input" v-model="username" placeholder="Username" required />
          <input class="input" v-model="password" type="password" placeholder="Password (min 6)" required />
  
          <button class="btn btn-primary" :disabled="auth.loading">
            {{ auth.loading ? "Creating..." : "Register" }}
          </button>
  
          <div v-if="msg" class="muted">{{ msg }}</div>
  
          <div class="muted">
            Already have an account?
            <router-link to="/login" class="link">Login</router-link>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  import { useAuthStore } from "../stores/auth";
  
  export default {
    name: "RegisterPage",
    setup() {
      const auth = useAuthStore();
      const email = ref("");
      const username = ref("");
      const password = ref("");
      const msg = ref("");
  
      async function submit() {
        msg.value = "";
        const res = await auth.register({ email: email.value, username: username.value, password: password.value });
        if (!res.ok) {
          msg.value = res.error;
          return;
        }
        msg.value = "Registered. You can login now.";
        email.value = "";
        username.value = "";
        password.value = "";
      }
  
      return { auth, email, username, password, msg, submit };
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