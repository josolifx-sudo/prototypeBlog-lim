<template>
  <article class="card thread">
    <div class="thread-row">
      <div class="avatar" aria-hidden="true"></div>

      <div class="thread-main">
        <div class="thread-top">
          <div class="thread-user">@{{ post.author?.username || "unknown" }}</div>
          <div class="dot">•</div>
          <div class="thread-date">{{ formatDate(post.createdAt) }}</div>

          <div class="spacer"></div>

          <button
            v-if="canEdit"
            class="btn btn-icon"
            type="button"
            title="Edit"
            @click="$emit('edit', post)"
          >
            ✎
          </button>
          <button
            v-if="canDelete"
            class="btn btn-icon danger"
            type="button"
            title="Delete"
            @click="$emit('delete', post)"
          >
            🗑
          </button>
        </div>

        <RouterLink class="thread-title" :to="`/posts/${post._id}`">
          {{ post.title }}
        </RouterLink>

        <div class="thread-content">
          {{ post.content }}
        </div>

        <div class="thread-actions">
          <RouterLink class="pill" :to="`/posts/${post._id}`">Comments</RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const props = defineProps({
  post: { type: Object, required: true }
});

defineEmits(["edit", "delete"]);

const auth = useAuthStore();

const canEdit = computed(() => {
  if (!auth.user) return false;
  const isOwner = props.post.author?._id === auth.user._id || props.post.author?.id === auth.user._id;
  return isOwner || auth.user.isAdmin;
});

const canDelete = canEdit;

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
</script>
