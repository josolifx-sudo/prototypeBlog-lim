<template>
    <div class="grid">
      <section class="hero glass">
        <div class="kicker">Strings the connects you!</div>
        <div class="headline">A meaningful conversation awaits you!</div>
        <div class="muted">
          Find and share your thoughts on various topics. Join the conversation and connect with others through your words.
        </div>

      <div class="hero-actions">
        <button v-if="auth.isLoggedIn" class="btn btn-primary" @click="openComposer = !openComposer">
          {{ openComposer ? "Close composer" : "Create post" }}
        </button>
        <router-link v-else to="/login" class="btn btn-primary">Login to post</router-link>

        <button class="btn btn-ghost" @click="refresh">Refresh</button>

        <div class="swapwrap">
          <FeedSwap v-model="mode" />
        </div>
      </div>

      <transition name="fade-up">
        <form v-if="openComposer" class="composer" @submit.prevent="create">
          <input class="input" v-model="title" placeholder="Title" required />
          <textarea v-model="content" rows="4" placeholder="Write your post..." required />
          <div class="row">
            <button class="btn btn-primary" :disabled="busy">
              {{ busy ? "Saving..." : "Publish" }}
            </button>
            <div v-if="msg" class="muted">{{ msg }}</div>
          </div>
        </form>
      </transition>
    </section>

    <section class="feed">
      <div v-if="posts.loading" class="glass pad pulse muted">Loading feed...</div>
      <div v-else-if="sortedFeed.length === 0" class="glass pad muted">No posts yet</div>

      <div v-else class="list">
        <ThreadCard v-for="p in sortedFeed" :key="p._id" :post="p" />
      </div>
    </section>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { usePostsStore } from "../stores/posts";
import StringsCard from "../components/StringsCard.vue";
import FeedSwap from "../components/FeedSwap.vue";

export default {
  name: "FeedPage",
  components: { StringsCard, FeedSwap },
  setup() {
    const auth = useAuthStore();
    const posts = usePostsStore();

    const openComposer = ref(false);
    const title = ref("");
    const content = ref("");
    const busy = ref(false);
    const msg = ref("");

    const mode = ref("latest");

    const sortedFeed = computed(() => {
      const list = [...posts.feed];

      if (mode.value === "latest") {
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return list.sort((a, b) => {
        const alen = (a.content || "").length;
        const blen = (b.content || "").length;
        return blen - alen;
      });
    });

    async function refresh() {
      await posts.fetchFeed();
    }

    async function create() {
      msg.value = "";
      busy.value = true;

      const res = await posts.createPost({ title: title.value, content: content.value });
      busy.value = false;

      if (!res.ok) {
        msg.value = res.error;
        return;
      }

      title.value = "";
      content.value = "";
      openComposer.value = false;

      await posts.fetchFeed();
      msg.value = "Posted";
      setTimeout(() => (msg.value = ""), 1500);
    }

    onMounted(async () => {
      if (auth.token && !auth.user) await auth.fetchMe();
      await posts.fetchFeed();
    });

    return {
      auth,
      posts,
      openComposer,
      title,
      content,
      busy,
      msg,
      create,
      refresh,
      mode,
      sortedFeed
    };
  }
};
</script>

<style scoped>
.grid { display: grid; gap: 14px; }

.hero { padding: 16px; border-radius: var(--radius); }

.kicker {
  display: inline-block;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.06);
  font-weight: 800;
  margin-bottom: 10px;
}

.headline { font-size: 26px; font-weight: 900; margin-bottom: 6px; }

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
  align-items: center;
}

.swapwrap {
  margin-left: auto;
}

.composer { margin-top: 12px; display: grid; gap: 10px; }

.row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.feed .pad { padding: 14px; border-radius: var(--radius); }

.list { display: grid; gap: 12px; }
</style>