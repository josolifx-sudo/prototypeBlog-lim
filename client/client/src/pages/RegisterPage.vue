<template>
  <section class="container">
    <div class="auth">
      <div class="card auth-card">
        <h1 class="h1">Register</h1>

        <div class="banner danger" v-if="auth.error">{{ auth.error }}</div>

        <form class="auth-form" @submit.prevent="submit">
          <label class="label">
            <span>Email</span>
            <input class="input" v-model.trim="email" type="email" autocomplete="email" required />
          </label>

          <label class="label">
            <span>Username</span>
            <input class="input" v-model.trim="username" type="text" minlength="3" maxlength="30" required />
          </label>

          <label class="label">
            <span>Password</span>
            <input class="input" v-model="password" type="password" minlength="6" required />
          </label>

          <button class="btn btn-solid full" type="submit" :disabled="busy">Create account</button>
        </form>

        <div class="muted">
          Already have an account?
          <RouterLink class="link" to="/login">Login</RouterLink>
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
const username = ref("");
const password = ref("");
const busy = ref(false);

async function submit() {
  busy.value = true;
  const ok = await auth.register({ email: email.value, username: username.value, password: password.value });
  busy.value = false;

  if (ok) {
    const next = typeof route.query.next === "string" ? route.query.next : "/";
    router.push(next);
  }
}
</script>
