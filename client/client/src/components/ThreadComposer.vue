<template>
  <div class="card composer">
    <div class="composer-head">
      <div class="avatar" aria-hidden="true"></div>
      <div class="composer-meta">
        <div class="composer-user">@{{ username }}</div>
        <div class="composer-hint">Post to your feed</div>
      </div>
    </div>

    <form class="composer-form" @submit.prevent="submit">
      <input
        v-model.trim="title"
        class="input"
        type="text"
        maxlength="120"
        placeholder="Title"
      />
      <textarea
        v-model.trim="content"
        class="input textarea"
        rows="4"
        maxlength="5000"
        placeholder="Share something"
      />

      <div class="composer-actions">
        <div class="muted" v-if="error">{{ error }}</div>
        <button class="btn btn-solid" type="submit" :disabled="busy || !title || !content">
          Post
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api";

const props = defineProps({
  username: { type: String, required: true }
});

const emit = defineEmits(["created"]);

const title = ref("");
const content = ref("");
const busy = ref(false);
const error = ref(null);

async function submit() {
  if (!title.value || !content.value) return;
  busy.value = true;
  error.value = null;

  try {
    const { data } = await api.post("/api/posts", {
      title: title.value,
      content: content.value
    });
    title.value = "";
    content.value = "";
    emit("created", data.post);
  } catch (e) {
    error.value = e?.response?.data?.message || e.message;
  } finally {
    busy.value = false;
  }
}
</script>
