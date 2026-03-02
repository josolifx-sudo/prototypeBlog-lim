<template>
    <div class="stack" v-if="posts.activePost">
      <section class="glass box">
        <div class="top">
          <button class="btn btn-ghost" @click="$router.push('/')">Back</button>
  
          <div class="right">
            <button v-if="canEdit" class="btn btn-ghost" @click="editing = !editing">
              {{ editing ? "Close edit" : "Edit" }}
            </button>
            <button v-if="canDelete" class="btn btn-danger" @click="removePost">Delete</button>
          </div>
        </div>
  
        <div class="meta">
          <div class="author">{{ posts.activePost.author?.username }}</div>
          <div class="muted tiny">{{ formatDate(posts.activePost.createdAt) }}</div>
        </div>
  
        <transition name="fade-up">
          <div v-if="!editing" class="content">
            <div class="title">{{ posts.activePost.title }}</div>
            <div class="body muted">{{ posts.activePost.content }}</div>
          </div>
  
          <form v-else class="edit" @submit.prevent="saveEdit">
            <input class="input" v-model="editTitle" required />
            <textarea v-model="editContent" rows="6" required />
            <div class="row">
              <button class="btn btn-primary" :disabled="busy">
                {{ busy ? "Saving..." : "Save" }}
              </button>
              <div v-if="msg" class="muted">{{ msg }}</div>
            </div>
          </form>
        </transition>
      </section>
  
      <CommentList
        :comments="posts.comments"
        :canAdminDelete="auth.isAdmin"
        @adminDelete="adminDeleteComment"
      />
  
      <div v-if="auth.isLoggedIn">
        <CommentComposer
          :loading="commentBusy"
          :error="commentMsg"
          @submit="submitComment"
        />
      </div>
  
      <div v-else class="glass box muted">
        Login to comment.
      </div>
    </div>
  
    <div v-else class="glass box pulse muted">
      Loading post...
    </div>
  </template>
  
  <script>
  import { computed, onMounted, ref } from "vue";
  import { useRoute } from "vue-router";
  import { useAuthStore } from "../stores/auth";
  import { usePostsStore } from "../stores/posts";
  import CommentList from "../components/CommentList.vue";
  import CommentComposer from "../components/CommentComposer.vue";
  
  export default {
    name: "PostViewPage",
    components: { CommentList, CommentComposer },
    setup() {
      const route = useRoute();
      const auth = useAuthStore();
      const posts = usePostsStore();
  
      const editing = ref(false);
      const busy = ref(false);
      const msg = ref("");
  
      const commentBusy = ref(false);
      const commentMsg = ref("");
  
      const editTitle = ref("");
      const editContent = ref("");
  
      const canEdit = computed(() => {
        const p = posts.activePost;
        if (!p || !auth.user) return false;
        return String(p.author?._id) === String(auth.user.id) || auth.isAdmin;
      });
  
      const canDelete = computed(() => canEdit.value);
  
      function formatDate(value) {
        const d = value ? new Date(value) : null;
        return d ? d.toLocaleString() : "";
      }
  
      async function load() {
        if (auth.token && !auth.user) await auth.fetchMe();
        await posts.fetchPost(route.params.id);
  
        editTitle.value = posts.activePost?.title || "";
        editContent.value = posts.activePost?.content || "";
      }
  
      async function saveEdit() {
        msg.value = "";
        busy.value = true;
  
        const res = await posts.updatePost(route.params.id, {
          title: editTitle.value,
          content: editContent.value
        });
  
        busy.value = false;
  
        if (!res.ok) {
          msg.value = res.error;
          return;
        }
  
        editing.value = false;
        await posts.fetchPost(route.params.id);
        msg.value = "Updated";
        setTimeout(() => (msg.value = ""), 1500);
      }
  
      async function removePost() {
        const res = await posts.deletePost(route.params.id);
        if (!res.ok) return;
  
        window.location.href = "/";
      }
  
      async function submitComment(text) {
        commentMsg.value = "";
        commentBusy.value = true;
  
        const res = await posts.addComment({ postId: route.params.id, text });
        commentBusy.value = false;
  
        if (!res.ok) {
          commentMsg.value = res.error;
          return;
        }
  
        await posts.fetchPost(route.params.id);
        commentMsg.value = "";
      }
  
      async function adminDeleteComment(commentId) {
        const res = await posts.adminDeleteComment(commentId);
        if (!res.ok) return;
        await posts.fetchPost(route.params.id);
      }
  
      onMounted(load);
  
      return {
        auth,
        posts,
        editing,
        busy,
        msg,
        commentBusy,
        commentMsg,
        editTitle,
        editContent,
        canEdit,
        canDelete,
        formatDate,
        saveEdit,
        removePost,
        submitComment,
        adminDeleteComment
      };
    }
  };
  </script>
  
  <style scoped>
  .stack { display: grid; gap: 14px; }
  .box { padding: 14px; border-radius: var(--radius); }
  
  .top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .right { display: flex; gap: 10px; flex-wrap: wrap; }
  
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
  }
  .author { font-weight: 900; }
  .tiny { font-size: 12px; }
  
  .content { margin-top: 12px; }
  .title { font-size: 22px; font-weight: 900; }
  .body { margin-top: 8px; white-space: pre-wrap; line-height: 1.6; }
  
  .edit { margin-top: 12px; display: grid; gap: 10px; }
  .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  </style>