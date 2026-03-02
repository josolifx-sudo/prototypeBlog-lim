<template>
    <div class="glass box">
      <div class="title">404</div>
      <div class="muted">Page not found</div>
      <div style="margin-top: 12px;">
        <router-link to="/" class="btn btn-primary">Back to feed</router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default { name: "NotFoundPage" };
  </script>
  
  <style scoped>
  .box { padding: 16px; border-radius: var(--radius); }
  .title { font-size: 28px; font-weight: 950; }
  </style>