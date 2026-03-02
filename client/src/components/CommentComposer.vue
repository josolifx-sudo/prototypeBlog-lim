<template>
    <div class="glass box">
      <div class="hdr">
        <div class="title">Add a comment</div>
        <div class="muted">Be respectful</div>
      </div>
  
      <form @submit.prevent="submit">
        <textarea
          v-model="text"
          rows="3"
          placeholder="Write your comment..."
          required
        />
        <div class="actions">
          <button class="btn btn-primary" :disabled="loading">
            {{ loading ? "Posting..." : "Post comment" }}
          </button>
          <div v-if="error" class="muted">{{ error }}</div>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: "CommentComposer",
    props: {
      loading: { type: Boolean, default: false },
      error: { type: String, default: "" }
    },
    emits: ["submit"],
    data() {
      return { text: "" };
    },
    methods: {
      submit() {
        this.$emit("submit", this.text);
        this.text = "";
      }
    }
  };
  </script>
  
  <style scoped>
  .box { padding: 14px; border-radius: var(--radius); margin-top: 12px; }
  .hdr {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
  }
  .title { font-weight: 850; }
  .actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  </style>