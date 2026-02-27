<template>
  <div class="comment">
    <div class="avatar sm" aria-hidden="true"></div>
    <div class="comment-body">
      <div class="comment-top">
        <div class="comment-user">@{{ comment.author?.username || "unknown" }}</div>
        <div class="dot">•</div>
        <div class="comment-date">{{ formatDate(comment.createdAt) }}</div>
        <div class="spacer"></div>
        <button v-if="canDelete" class="btn btn-icon danger" type="button" title="Delete" @click="$emit('delete', comment)">
          🗑
        </button>
      </div>
      <div class="comment-content">{{ comment.content }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const props = defineProps({
  comment: { type: Object, required: true }
});

defineEmits(["delete"]);

const auth = useAuthStore();

const canDelete = computed(() => {
  if (!auth.user) return false;
  const isOwner = props.comment.author?._id === auth.user._id || props.comment.author?.id === auth.user._id;
  return isOwner || auth.user.isAdmin;
});

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
</script>
