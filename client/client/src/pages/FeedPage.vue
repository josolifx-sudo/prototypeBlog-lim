<template>
  <section class="container">
    <div class="page-head">
      <h1 class="h1">Feed</h1>
      <div class="page-sub">Latest posts from the community</div>
    </div>

    <ThreadComposer
      v-if="auth.isAuthed"
      :username="auth.user?.username || 'user'"
      @created="onCreated"
    />

    <div class="card" v-if="error">{{ error }}</div>

    <div class="list" v-if="!loading">
      <ThreadCard
        v-for="p in posts"
        :key="p._id"
        :post="p"
        @edit="openEdit"
        @delete="removePost"
      />

      <div class="empty" v-if="posts.length === 0">No posts yet.</div>
    </div>

    <div class="card" v-else>Loading…</div>

    <div class="modal" v-if="editOpen" @click.self="closeEdit">
      <div class="modal-card">
        <div class="modal-head">
          <div class="modal-title">Edit post</div>
          <button class="btn btn-icon" type="button" @click="closeEdit">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="saveEdit">
          <input class="input" type="text" maxlength="120" v-model.trim="editTitle" placeholder="Title" />
          <textarea class="input textarea" rows="5" maxlength="5000" v-model.trim="editContent" placeholder="Content" />

          <div class="modal-actions">
            <div class="muted" v-if="editError">{{ editError }}</div>
            <button class="btn btn-solid" type="submit" :disabled="editBusy || !editTitle || !editContent">Save</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api";
import { useAuthStore } from "../stores/auth";

import ThreadComposer from "../components/ThreadComposer.vue";
import ThreadCard from "../components/ThreadCard.vue";

const auth = useAuthStore();

const posts = ref([]);
const loading = ref(true);
const error = ref(null);

const editOpen = ref(false);
const editBusy = ref(false);
const editError = ref(null);
const editingId = ref(null);
const editTitle = ref("");
const editContent = ref("");

async function fetchPosts() {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get("/api/posts");
    posts.value = data.posts;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message;
  } finally {
    loading.value = false;
  }
}

function onCreated(newPost) {
  posts.value = [newPost, ...posts.value];
}

function openEdit(post) {
  editingId.value = post._id;
  editTitle.value = post.title;
  editContent.value = post.content;
  editError.value = null;
  editOpen.value = true;
}

function closeEdit() {
  editOpen.value = false;
  editingId.value = null;
}

async function saveEdit() {
  if (!editingId.value) return;
  editBusy.value = true;
  editError.value = null;

  try {
    const { data } = await api.put(`/api/posts/${editingId.value}`, {
      title: editTitle.value,
      content: editContent.value
    });

    posts.value = posts.value.map((p) => (p._id === editingId.value ? data.post : p));
    closeEdit();
  } catch (e) {
    editError.value = e?.response?.data?.message || e.message;
  } finally {
    editBusy.value = false;
  }
}

async function removePost(post) {
  if (!confirm("Delete this post?")) return;
  try {
    await api.delete(`/api/posts/${post._id}`);
    posts.value = posts.value.filter((p) => p._id !== post._id);
  } catch (e) {
    alert(e?.response?.data?.message || e.message);
  }
}

onMounted(async () => {
  await auth.bootstrap();
  await fetchPosts();
});
</script>
