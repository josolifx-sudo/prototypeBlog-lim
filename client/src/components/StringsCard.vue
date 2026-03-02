<template>
  <article
    ref="card"
    class="card glass"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <div class="spot" aria-hidden="true"></div>

    <div class="head" @click="open">
      <div class="avatar">
        <img v-if="post.author?.avatarUrl" :src="post.author.avatarUrl" class="avatarImg" />
        <span v-else>{{ initials }}</span>
      </div>

      <div class="meta">
        <div class="row">
          <div class="name">{{ post.author?.username || "unknown" }}</div>
          <div class="muted tiny">{{ timeLabel }}</div>
        </div>
        <div class="title">{{ post.title }}</div>
      </div>
    </div>

    <div v-if="post.imageUrl" class="imgWrap" @click="open">
      <img :src="post.imageUrl" class="postImg" />
    </div>

    <div class="content muted" @click="open">{{ preview }}</div>

    <div class="actions">
      <button class="iconBtn" type="button" @click="like">
        <span class="heart" :class="{ on: post.likedByMe }">♥</span>
        <span class="count">{{ post.likeCount || 0 }}</span>
      </button>

      <div class="muted tiny">Click to view</div>
    </div>
  </article>
</template>

<script>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { usePostsStore } from "../stores/posts";

export default {
  name: "StringsCard",
  props: {
    post: { type: Object, required: true }
  },
  setup(props) {
    const card = ref(null);
    const router = useRouter();
    const posts = usePostsStore();

    const initials = computed(() => {
      const u = props.post?.author?.username || "U";
      return u.slice(0, 2).toUpperCase();
    });

    const preview = computed(() => {
      const t = props.post?.content || "";
      return t.length > 220 ? t.slice(0, 220) + "..." : t;
    });

    const timeLabel = computed(() => {
      const d = props.post?.createdAt ? new Date(props.post.createdAt) : null;
      return d ? d.toLocaleString() : "";
    });

    function setVars(x, y, a) {
      const el = card.value;
      if (!el) return;
      el.style.setProperty("--sx", `${x}px`);
      el.style.setProperty("--sy", `${y}px`);
      el.style.setProperty("--sa", `${a}`);
    }

    function onMove(e) {
      const el = card.value;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setVars(e.clientX - r.left, e.clientY - r.top, 1);
    }

    function onLeave() {
      setVars(0, 0, 0);
    }

    function open() {
      router.push(`/post/${props.post._id}`);
    }

    async function like() {
      await posts.toggleLike(props.post._id);
    }

    return { card, initials, preview, timeLabel, onMove, onLeave, open, like };
  }
};
</script>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
  padding: 14px;
  border-radius: var(--radius);
  transform: translateY(0);
  transition: transform 160ms ease, box-shadow 180ms ease, background 180ms ease;
}

.card:hover {
  transform: translateY(-2px);
  background: var(--panel-strong);
  box-shadow: var(--shadow);
}

.spot {
  position: absolute;
  inset: -2px;
  background:
    radial-gradient(
      520px 360px at var(--sx, 0px) var(--sy, 0px),
      rgba(37, 99, 235, calc(0.22 * var(--sa, 0))),
      transparent 58%
    ),
    radial-gradient(
      680px 460px at var(--sx, 0px) var(--sy, 0px),
      rgba(124, 58, 237, calc(0.18 * var(--sa, 0))),
      transparent 66%
    );
  pointer-events: none;
}

.head {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  cursor: pointer;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.75);
  display: grid;
  place-items: center;
  font-weight: 850;
  overflow: hidden;
}

.avatarImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: avIn 220ms ease;
}

@keyframes avIn {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}

.meta { flex: 1; }

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.name { font-weight: 850; }
.title { margin-top: 4px; font-weight: 900; }

.imgWrap {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--line);
  cursor: pointer;
}

.postImg {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
  background: rgba(255,255,255,0.7);
}

.content {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  line-height: 1.55;
  white-space: pre-wrap;
  cursor: pointer;
}

.actions {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.iconBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.65);
  cursor: pointer;
}

.heart {
  font-size: 16px;
  transform: translateY(-1px);
  transition: transform 140ms ease;
  color: rgba(17,24,39,0.45);
}

.heart.on {
  color: #e11d48;
  transform: scale(1.15);
}

.count {
  font-weight: 850;
}
.tiny { font-size: 12px; }
</style>