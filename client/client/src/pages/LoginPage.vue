<template>
  <section class="container">
    <div class="auth">
      <div class="card auth-card">
        <h1 class="h1">Login</h1>

        <div class="banner danger" v-if="auth.error">{{ auth.error }}</div>

        <form class="auth-form" @submit.prevent="submit">
          <label class="label">
            <span>Email</span>
            <input class="input" v-model.trim="email" type="email" autocomplete="email" required />
          </label>

          <label class="label">
            <span>Password</span>
            <input class="input" v-model="password" type="password" autocomplete="current-password" required />
          </label>

          <button class="btn btn-solid full" type="submit" :disabled="busy">Login</button>
        </form>

        <div class="muted">
          No account?
          <RouterLink class="link" to="/register">Register</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const busy = ref(false);

async function submit() {
  busy.value = true;
  const ok = await auth.login({ email: email.value, password: password.value });
  busy.value = false;

  if (ok) {
    const next = typeof route.query.next === "string" ? route.query.next : "/";
    router.push(next);
  }
}
</script>
