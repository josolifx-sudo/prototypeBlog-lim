<template>
  <section class="container">
    <div class="page-head">
      <RouterLink class="back" to="/">← Back to feed</RouterLink>
    </div>

    <div class="card" v-if="loading">Loading…</div>
    <div class="card" v-else-if="error">{{ error }}</div>

    <template v-else>
      <article class="card thread">
        <div class="thread-row">
          <div class="avatar" aria-hidden="true"></div>
          <div class="thread-main">
            <div class="thread-top">
              <div class="thread-user">@{{ post.author?.username || 'unknown' }}</div>
              <div class="dot">•</div>
              <div class="thread-date">{{ formatDate(post.createdAt) }}</div>
            </div>

            <div class="thread-title">{{ post.title }}</div>
            <div class="thread-content">{{ post.content }}</div>
          </div>
        </div>
      </article>

      <div class="card" v-if="auth.isAuthed">
        <form class="comment-form" @submit.prevent="submitComment">
          <textarea
            v-model.trim="comment"
            class="input textarea"
            rows="3"
            maxlength="800"
            placeholder="Write a comment"
          />
          <div class="composer-actions">
            <div class="muted" v-if="commentError">{{ commentError }}</div>
            <button class="btn btn-solid" type="submit" :disabled="commentBusy || !comment">Comment</button>
          </div>
        </form>
      </div>

      <div class="list">
        <div class="section-title">Comments</div>

        <CommentItem
          v-for="c in comments"
          :key="c._id"
          :comment="c"
          @delete="deleteComment"
        />

        <div class="empty" v-if="comments.length === 0">No comments yet.</div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import api from "../api";
import { useAuthStore } from "../stores/auth";

import CommentItem from "../components/CommentItem.vue";

const auth = useAuthStore();
const route = useRoute();

const loading = ref(true);
const error = ref(null);

const post = ref(null);
const comments = ref([]);

const comment = ref("");
const commentBusy = ref(false);
const commentError = ref(null);

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

async function fetchPost() {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get(`/api/posts/${route.params.id}`);
    post.value = data.post;
    comments.value = data.comments;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message;
  } finally {
    loading.value = false;
  }
}

async function submitComment() {
  if (!comment.value) return;
  commentBusy.value = true;
  commentError.value = null;

  try {
    const { data } = await api.post(`/api/posts/${route.params.id}/comments`, {
      content: comment.value
    });
    comments.value = [data.comment, ...comments.value];
    comment.value = "";
  } catch (e) {
    commentError.value = e?.response?.data?.message || e.message;
  } finally {
    commentBusy.value = false;
  }
}

async function deleteComment(c) {
  if (!confirm("Delete this comment?")) return;
  try {
    await api.delete(`/api/comments/${c._id}`);
    comments.value = comments.value.filter((x) => x._id !== c._id);
  } catch (e) {
    alert(e?.response?.data?.message || e.message);
  }
}

onMounted(async () => {
  await auth.bootstrap();
  await fetchPost();
});
</script>
