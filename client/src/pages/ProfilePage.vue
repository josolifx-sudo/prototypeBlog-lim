<template>
  <div class="glass box">
    <div class="hdr">
      <div>
        <div class="title">Profile</div>
        <div class="muted">Manage your account and photos</div>
      </div>

      <div class="avatarBig">
        <img v-if="auth.user?.avatarUrl" :src="auth.user.avatarUrl" alt="avatar" />
        <div v-else class="avatarFallback">{{ initials }}</div>
      </div>
    </div>

    <div v-if="auth.user" class="grid">
      <div class="row">
        <div class="label">Username</div>
        <div class="value">{{ auth.user.username }}</div>
      </div>

      <div class="row">
        <div class="label">Email</div>
        <div class="value">{{ auth.user.email }}</div>
      </div>

      <div class="row">
        <div class="label">Role</div>
        <div class="value">{{ auth.user.isAdmin ? "Admin" : "User" }}</div>
      </div>

      <div class="photos">
        <div class="photosTop">
          <div>
            <div class="sectionTitle">Your photos</div>
            <div class="muted">Maximum 5. Choose one as your display picture.</div>
          </div>

          <div class="countPill">{{ (auth.user.photos || []).length }}/5</div>
        </div>

        <div class="addRow">
          <input class="input" v-model="newUrl" placeholder="Paste an image URL (https://...)" />
          <button class="btn btn-primary" :disabled="addDisabled" @click="add">
            Add
          </button>
        </div>

        <div v-if="auth.error" class="muted err">{{ auth.error }}</div>

        <div v-if="(auth.user.photos || []).length === 0" class="muted pad">
          No photos yet. Add one to set your display picture.
        </div>

        <div v-else class="thumbGrid">
          <div v-for="p in auth.user.photos" :key="p" class="thumb glass">
            <img :src="p" alt="photo" />
            <div class="thumbActions">
              <button
                class="btn btn-ghost"
                :disabled="auth.user.avatarUrl === p"
                @click="setAsAvatar(p)"
              >
                {{ auth.user.avatarUrl === p ? "Current" : "Set DP" }}
              </button>
              <button class="btn btn-danger" @click="remove(p)">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="muted pulse">Loading profile...</div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";

export default {
  name: "ProfilePage",
  setup() {
    const auth = useAuthStore();
    const newUrl = ref("");

    const initials = computed(() => {
      const u = auth.user?.username || "U";
      return u.slice(0, 2).toUpperCase();
    });

    const addDisabled = computed(() => {
      const count = (auth.user?.photos || []).length;
      return !newUrl.value.trim() || count >= 5;
    });

    async function add() {
      const url = newUrl.value.trim();
      if (!url) return;

      const res = await auth.addPhoto(url);
      if (res.ok) newUrl.value = "";
    }

    async function remove(url) {
      await auth.removePhoto(url);
    }

    async function setAsAvatar(url) {
      await auth.setAvatar(url);
    }

    onMounted(async () => {
      if (auth.token && !auth.user) await auth.fetchMe();
    });

    return { auth, newUrl, initials, addDisabled, add, remove, setAsAvatar };
  }
};
</script>

<style scoped>
.box { padding: 16px; border-radius: var(--radius); }

.hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.title { font-size: 24px; font-weight: 900; margin-bottom: 4px; }

.avatarBig {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.8);
  overflow: hidden;
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-soft);
}

.avatarBig img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatarFallback { font-weight: 900; }

.grid { margin-top: 10px; display: grid; gap: 10px; }

.row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(255,255,255,0.65);
}

.label { font-weight: 850; color: var(--muted); }
.value { font-weight: 750; }

.photos {
  margin-top: 8px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(255,255,255,0.65);
}

.sectionTitle { font-weight: 900; margin-bottom: 2px; }

.photosTop {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.countPill {
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.75);
  font-weight: 850;
}

.addRow {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.thumbGrid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.thumb {
  border-radius: 16px;
  overflow: hidden;
  padding: 10px;
}

.thumb img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.8);
  display: block;
}

.thumbActions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pad { padding: 10px 0; }
.err { margin-top: 8px; }
</style>