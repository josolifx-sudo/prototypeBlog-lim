<template>
    <div class="glass box">
      <div class="hdr">
        <div class="title">Comments</div>
        <div class="muted">{{ comments.length }} total</div>
      </div>
  
      <div v-if="comments.length === 0" class="muted pulse">No comments yet</div>
  
      <div v-else class="list">
        <div v-for="c in comments" :key="c._id" class="item">
          <div class="left">
            <div class="badge">{{ (c.author?.username || "U").slice(0, 2).toUpperCase() }}</div>
          </div>
  
          <div class="main">
            <div class="row">
              <div class="who">{{ c.author?.username || "unknown" }}</div>
              <div class="muted tiny">{{ formatDate(c.createdAt) }}</div>
            </div>
            <div class="text muted">{{ c.text }}</div>
          </div>
  
          <div class="right" v-if="canAdminDelete">
            <button class="btn btn-danger" @click.prevent="$emit('adminDelete', c._id)">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "CommentList",
    props: {
      comments: { type: Array, required: true },
      canAdminDelete: { type: Boolean, default: false }
    },
    emits: ["adminDelete"],
    methods: {
      formatDate(value) {
        const d = value ? new Date(value) : null;
        return d ? d.toLocaleString() : "";
      }
    }
  };
  </script>
  
  <style scoped>
  .box { padding: 14px; border-radius: var(--radius); }
  .hdr {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
  }
  .title { font-weight: 850; }
  
  .list { display: grid; gap: 10px; }
  .item {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    gap: 10px;
    padding: 10px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: rgba(0,0,0,0.18);
  }
  
  .badge {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    border: 1px solid var(--line);
    background: rgba(255,255,255,0.06);
    font-weight: 800;
  }
  
  .row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: baseline;
  }
  .who { font-weight: 800; }
  .text { margin-top: 4px; white-space: pre-wrap; line-height: 1.55; }
  .tiny { font-size: 12px; }
  </style>