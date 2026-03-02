<template>
  <div class="stack" v-if="posts.currentPost">
    <section class="glass box">
      <div class="top">
        <button class="btn btn-ghost" @click="goBack">Back</button>

        <div class="right">
          <button v-if="canEdit" class="btn btn-ghost" @click="editing = !editing">
            {{ editing ? "Close edit" : "Edit" }}
          </button>
          <button v-if="canDelete" class="btn btn-danger" @click="removePost">
            Delete
          </button>
        </div>
      </div>

      <div class="meta">
        <div class="author">{{ posts.currentPost.author?.username }}</div>
        <div class="muted tiny">{{ formatDate(posts.currentPost.createdAt) }}</div>
      </div>

      <transition name="fade-up">
        <div v-if="!editing" class="content">
          <div class="title">{{ posts.currentPost.title }}</div>

          <div v-if="posts.currentPost.imageUrl" class="imgWrap">
            <img :src="posts.currentPost.imageUrl" class="postImg" />
          </div>

          <div class="body muted">{{ posts.currentPost.content }}</div>

          <div class="actions">
            <button class="btn" @click="like">
              <span :class="['heart', posts.currentPost.likedByMe ? 'on' : '']">♥</span>
              {{ posts.currentPost.likeCount || 0 }}
            </button>
          </div>
        </div>

        <form v-else class="edit" @submit.prevent="saveEdit">
          <input class="input" v-model="editTitle" required />
          <textarea class="input" v-model="editContent" rows="6" required />

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
    <div v-if="posts.error" class="muted" style="margin-top:10px;">
      {{ posts.error }}
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";

import { useAuthStore } from "../stores/auth";
import { usePostsStore } from "../stores/posts";

import CommentList from "../components/CommentList.vue";
import CommentComposer from "../components/CommentComposer.vue";

export default {
  name: "PostViewPage",
  components: { CommentList, CommentComposer },

  setup() {
    const route = useRoute();
    const router = useRouter();

    const auth = useAuthStore();
    const posts = usePostsStore();

    const editing = ref(false);
    const busy = ref(false);
    const msg = ref("");

    const commentBusy = ref(false);
    const commentMsg = ref("");

    const editTitle = ref("");
    const editContent = ref("");

    const postId = computed(() => route.params.id || route.params.postId);

    const canEdit = computed(() => {
      const p = posts.currentPost;
      if (!p || !auth.user) return false;

      const authorId = p.author?._id || p.author?.id;
      return String(authorId) === String(auth.user.id) || auth.isAdmin;
    });

    const canDelete = computed(() => canEdit.value);

    function formatDate(value) {
      const d = value ? new Date(value) : null;
      return d ? d.toLocaleString() : "";
    }

    function goBack() {
      router.push("/");
    }

    async function load() {
      if (!postId.value) return;

      if (auth.token && !auth.user) await auth.fetchMe();
      await posts.fetchPost(postId.value);

      editTitle.value = posts.currentPost?.title || "";
      editContent.value = posts.currentPost?.content || "";
    }

    async function saveEdit() {
      msg.value = "";
      busy.value = true;

      try {
        const res = await api.put(`/posts/${postId.value}`, {
          title: editTitle.value,
          content: editContent.value,
          imageUrl: posts.currentPost?.imageUrl || ""
        });

        posts.currentPost = res.data.post;
        editing.value = false;
      } catch (err) {
        msg.value = err?.response?.data?.error || "Update failed";
      } finally {
        busy.value = false;
      }
    }

    async function removePost() {
      if (!confirm("Delete this post?")) return;

      try {
        await api.delete(`/posts/${postId.value}`);
        router.push("/");
      } catch (err) {
        alert(err?.response?.data?.error || "Delete failed");
      }
    }

    async function like() {
      await posts.toggleLike(postId.value);
    }

    async function submitComment(text) {
      commentMsg.value = "";
      commentBusy.value = true;

      try {
        await api.post("/comments", { postId: postId.value, text });
        await posts.fetchPost(postId.value);
      } catch (err) {
        commentMsg.value = err?.response?.data?.error || "Comment failed";
      } finally {
        commentBusy.value = false;
      }
    }

    async function adminDeleteComment(commentId) {
      try {
        await api.delete(`/comments/${commentId}`);
        await posts.fetchPost(postId.value);
      } catch (err) {
        alert(err?.response?.data?.error || "Delete comment failed");
      }
    }

    onMounted(load);
    watch(() => postId.value, load);

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
      goBack,
      saveEdit,
      removePost,
      submitComment,
      adminDeleteComment,
      like
    };
  }
};
</script>

<style scoped>
.stack {
  display: grid;
  gap: 12px;
}

.box {
  padding: 16px;
  border-radius: var(--radius);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meta {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
}

.author {
  font-weight: 900;
}

.tiny {
  font-size: 12px;
}

.content {
  margin-top: 12px;
}

.title {
  font-size: 22px;
  font-weight: 950;
  margin-bottom: 10px;
}

.imgWrap {
  margin: 10px 0 12px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.postImg {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  display: block;
}

.body {
  white-space: pre-wrap;
  line-height: 1.6;
}

.actions {
  margin-top: 12px;
}

.heart {
  font-weight: 900;
  margin-right: 6px;
  color: rgba(17,24,39,0.45);
}
.heart.on {
  color: #e11d48;
}

.edit {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
</style>