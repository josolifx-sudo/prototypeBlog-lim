<template>
  <div class="glass box">
    <div class="hdr">
      <div>
        <div class="title">Profile</div>
        <div class="muted">Manage your account and photos</div>
      </div>

      <div class="avatarBig">
        <img v-if="auth.user?.avatarUrl" :src="auth.user.avatarUrl" />
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
        <div class="sectionTitle">Your Photos (Max 5)</div>

        <div class="addRow">
          <input class="input" v-model="newUrl" placeholder="Paste direct image URL" />
          <button class="btn btn-primary" :disabled="!newUrl" @click="addUrl">
            Add URL
          </button>
        </div>

        <div class="uploadRow">
          <input ref="fileRef" class="input" type="file" accept="image/*" />
          <button class="btn btn-primary" :disabled="uploading" @click="uploadFile">
            {{ uploading ? "Uploading..." : "Upload File" }}
          </button>
        </div>

        <div v-if="auth.error" class="err">{{ auth.error }}</div>

        <div class="thumbGrid" v-if="auth.user.photos?.length">
          <div v-for="p in auth.user.photos" :key="p" class="thumb glass">
            <img :src="p" />
            <div class="thumbActions">
              <button
                class="btn btn-ghost"
                :disabled="auth.user.avatarUrl === p"
                @click="setAvatar(p)"
              >
                {{ auth.user.avatarUrl === p ? "Current" : "Set DP" }}
              </button>

              <button class="btn btn-danger" @click="remove(p)">
                Remove
              </button>
            </div>
          </div>
        </div>

        <div v-else class="muted">No photos yet.</div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";

export default {
  setup() {
    const auth = useAuthStore();
    const newUrl = ref("");
    const fileRef = ref(null);
    const uploading = ref(false);

    const initials = computed(() =>
      (auth.user?.username || "U").slice(0, 2).toUpperCase()
    );

    async function addUrl() {
      if (!newUrl.value) return;
      const res = await auth.addPhoto(newUrl.value.trim());
      if (res.ok) newUrl.value = "";
    }

    async function uploadFile() {
      if (!fileRef.value?.files?.length) return;

      uploading.value = true;
      const res = await auth.uploadPhotoFile(fileRef.value.files[0]);
      uploading.value = false;

      if (res.ok) fileRef.value.value = "";
    }

    async function remove(url) {
      await auth.removePhoto(url);
    }

    async function setAvatar(url) {
      await auth.setAvatar(url);
    }

    onMounted(async () => {
      if (auth.token && !auth.user) await auth.fetchMe();
    });

    return {
      auth,
      newUrl,
      initials,
      addUrl,
      fileRef,
      uploadFile,
      uploading,
      remove,
      setAvatar
    };
  }
};
</script>

<style scoped>
.box { padding: 20px; border-radius: 20px; }

.hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title { font-size: 24px; font-weight: 900; }

.avatarBig {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.avatarBig img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatarFallback {
  display: grid;
  place-items: center;
  font-weight: 900;
}

.row {
  display: grid;
  grid-template-columns: 120px 1fr;
  margin: 8px 0;
}

.photos { margin-top: 20px; }

.sectionTitle { font-weight: 800; margin-bottom: 10px; }

.addRow,
.uploadRow {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin-bottom: 10px;
}

.thumbGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.thumb img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
}

.thumbActions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.err { color: #dc2626; margin-bottom: 8px; }
</style>