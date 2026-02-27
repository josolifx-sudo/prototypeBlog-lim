<template>
  <header class="nav">
    <div class="nav-inner">
      <RouterLink class="brand" to="/">ThreadsBlog</RouterLink>

      <nav class="nav-links">
        <RouterLink class="nav-link" to="/">Feed</RouterLink>
        <RouterLink v-if="auth.isAuthed" class="nav-link" to="/profile">Profile</RouterLink>
        <RouterLink v-if="auth.isAdmin" class="nav-link" to="/admin">Admin</RouterLink>
      </nav>

      <div class="nav-actions">
        <template v-if="!auth.isAuthed">
          <RouterLink class="btn btn-ghost" to="/login">Login</RouterLink>
          <RouterLink class="btn btn-solid" to="/register">Register</RouterLink>
        </template>
        <template v-else>
          <span class="user-pill" :title="auth.user?.email">@{{ auth.user?.username }}</span>
          <button class="btn btn-ghost" type="button" @click="onLogout">Logout</button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function onLogout() {
  auth.logout();
  router.push({ name: "feed" });
}
</script>
