<template>
  <section class="container">
    <div class="page-head">
      <h1 class="h1">Profile</h1>
    </div>

    <div class="card" v-if="!auth.user">Loading…</div>

    <div class="card" v-else>
      <div class="profile-row">
        <div class="avatar" aria-hidden="true"></div>
        <div>
          <div class="profile-user">@{{ auth.user.username }}</div>
          <div class="muted">{{ auth.user.email }}</div>
        </div>
      </div>

      <form class="profile-form" @submit.prevent="save">
        <label class="label">
          <span>Username</span>
          <input class="input" v-model.trim="username" type="text" minlength="3" maxlength="30" required />
        </label>

        <div class="row">
          <button class="btn btn-solid" type="submit" :disabled="busy || !username">Save</button>
          <div class="muted" v-if="msg">{{ msg }}</div>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const username = ref("");
const busy = ref(false);
const msg = ref("");

onMounted(async () => {
  await auth.bootstrap();
  username.value = auth.user?.username || "";
});

async function save() {
  busy.value = true;
  msg.value = "";
  try {
    const { data } = await api.put("/api/users/me", { username: username.value });
    auth.user = data.user;
    msg.value = "Saved";
  } catch (e) {
    msg.value = e?.response?.data?.message || e.message;
  } finally {
    busy.value = false;
  }
}
</script>
