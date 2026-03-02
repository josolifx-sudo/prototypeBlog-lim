<template>
  <div class="layout">
    <div class="main">
      <section class="hero glass">
        <div class="badge">Strings that connects you!</div>
        <h1>A meaningful conversation awaits you!</h1>
        <p class="muted">
          Find and share your thoughts on various topics. Join the conversation and connect with others through your words.
        </p>

        <div class="heroActions">
          <button class="btn btn-primary" @click="goCreate">Create post</button>
          <button class="btn" @click="refresh">Refresh</button>
        </div>
      </section>

      <transition-group name="stagger" tag="div" class="list">
        <template v-if="posts.loading">
          <SkeletonCard v-for="n in 4" :key="`sk-${n}`" />
        </template>

        <template v-else>
          <StringsCard v-for="p in posts.feed" :key="p._id" :post="p" />
        </template>
      </transition-group>

      <div v-if="posts.error" class="muted pad">{{ posts.error }}</div>

      <div ref="sentinel" class="sentinel">
        <div v-if="posts.loadingMore" class="muted">Loading more...</div>
        <div v-else-if="!posts.hasMore && !posts.loading" class="muted">You reached the end.</div>
      </div>
    </div>

    <TrendingPanel :trending="posts.trending" :loading="posts.trendingLoading" />
  </div>
</template>

<script>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { usePostsStore } from "../stores/posts";

import StringsCard from "../components/StringsCard.vue";
import SkeletonCard from "../components/SkeletonCard.vue";
import TrendingPanel from "../components/TrendingPanel.vue";

export default {
  name: "FeedPage",
  components: { StringsCard, SkeletonCard, TrendingPanel },
  setup() {
    const posts = usePostsStore();
    const router = useRouter();

    const sentinel = ref(null);
    let io = null;

    async function refresh() {
      await posts.fetchFeedFirstPage();
      await posts.fetchTrending();
    }

    function goCreate() {
      router.push("/create");
    }

    function setupObserver() {
      if (!sentinel.value) return;

      io = new IntersectionObserver(
        async (entries) => {
          const e = entries[0];
          if (e.isIntersecting) {
            await posts.fetchMore();
          }
        },
        { root: null, threshold: 0.2 }
      );

      io.observe(sentinel.value);
    }

    onMounted(async () => {
      await refresh();
      setupObserver();
    });

    onBeforeUnmount(() => {
      if (io) io.disconnect();
    });

    return { posts, sentinel, refresh, goCreate };
  }
};
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.main {
  display: grid;
  gap: 14px;
}

.hero {
  padding: 18px;
  border-radius: var(--radius);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.75);
  font-weight: 850;
  margin-bottom: 10px;
}

h1 {
  margin: 6px 0 8px;
  font-size: 28px;
  line-height: 1.15;
}

.heroActions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.list {
  display: grid;
  gap: 12px;
}

.sentinel {
  padding: 16px 0;
  text-align: center;
}

.pad { padding: 10px 0; }
</style>