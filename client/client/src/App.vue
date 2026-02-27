<template>
  <div class="app-shell">
    <AppNav />

    <main class="page">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-inner">© {{ new Date().getFullYear() }} ThreadsBlog</div>
    </footer>
  </div>
</template>

<script setup>
import AppNav from "./components/AppNav.vue";
</script>
