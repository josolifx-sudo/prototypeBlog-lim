<template>
    <div class="sk glass">
      <div class="top">
        <div class="av shimmer"></div>
        <div class="meta">
          <div class="line w1 shimmer"></div>
          <div class="line w2 shimmer"></div>
        </div>
        <div class="time shimmer"></div>
      </div>
  
      <div class="body">
        <div class="line w3 shimmer"></div>
        <div class="line w4 shimmer"></div>
        <div class="line w5 shimmer"></div>
      </div>
  
      <div class="bottom">
        <div class="chip shimmer"></div>
        <div class="chip shimmer"></div>
      </div>
    </div>
  </template>
  
  <script>
  export default { name: "SkeletonCard" };
  </script>
  
  <style scoped>
  .sk {
    padding: 14px;
    border-radius: var(--radius);
    overflow: hidden;
  }
  
  .top {
    display: grid;
    grid-template-columns: 44px 1fr 140px;
    gap: 12px;
    align-items: center;
  }
  
  .av {
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }
  
  .meta {
    display: grid;
    gap: 8px;
  }
  
  .time {
    height: 12px;
    border-radius: 999px;
  }
  
  .body {
    margin-top: 14px;
    display: grid;
    gap: 10px;
  }
  
  .line {
    height: 12px;
    border-radius: 999px;
  }
  
  .bottom {
    margin-top: 14px;
    display: flex;
    gap: 10px;
  }
  
  .chip {
    width: 84px;
    height: 28px;
    border-radius: 999px;
  }
  
  .w1 { width: 45%; }
  .w2 { width: 70%; }
  .w3 { width: 92%; }
  .w4 { width: 86%; }
  .w5 { width: 64%; }
  
  .shimmer {
    background: linear-gradient(90deg, rgba(17,24,39,0.08), rgba(17,24,39,0.14), rgba(17,24,39,0.08));
    background-size: 200% 100%;
    animation: sh 1.2s ease-in-out infinite;
  }
  
  @keyframes sh {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  </style>