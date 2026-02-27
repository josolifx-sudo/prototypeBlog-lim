<template>
  <section class="container">
    <div class="page-head">
      <h1 class="h1">Admin</h1>
      <div class="page-sub">User management</div>
    </div>

    <div class="card" v-if="loading">Loading…</div>
    <div class="card" v-else-if="error">{{ error }}</div>

    <div class="card" v-else>
      <div class="table">
        <div class="tr th">
          <div>Email</div>
          <div>Username</div>
          <div>Admin</div>
          <div></div>
        </div>

        <div class="tr" v-for="u in users" :key="u._id">
          <div class="mono">{{ u.email }}</div>
          <div>
            <input class="input sm" v-model.trim="u._editUsername" />
          </div>
          <div>
            <label class="toggle">
              <input type="checkbox" v-model="u._editIsAdmin" />
              <span></span>
            </label>
          </div>
          <div class="actions">
            <button class="btn btn-ghost" type="button" @click="saveUser(u)">Save</button>
            <button class="btn btn-ghost danger" type="button" @click="deleteUser(u)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const loading = ref(true);
const error = ref(null);
const users = ref([]);

async function fetchUsers() {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get("/api/users");
    users.value = data.users.map((u) => ({
      ...u,
      _editUsername: u.username,
      _editIsAdmin: !!u.isAdmin
    }));
  } catch (e) {
    error.value = e?.response?.data?.message || e.message;
  } finally {
    loading.value = false;
  }
}

async function saveUser(u) {
  try {
    const { data } = await api.put(`/api/users/${u._id}`, {
      username: u._editUsername,
      isAdmin: u._editIsAdmin
    });

    const updated = data.user;
    users.value = users.value.map((x) =>
      x._id === updated._id
        ? { ...updated, _editUsername: updated.username, _editIsAdmin: !!updated.isAdmin }
        : x
    );

    if (auth.user?._id === updated._id) {
      auth.user = updated;
    }
  } catch (e) {
    alert(e?.response?.data?.message || e.message);
  }
}

async function deleteUser(u) {
  if (!confirm(`Delete ${u.email}?`)) return;
  try {
    await api.delete(`/api/users/${u._id}`);
    users.value = users.value.filter((x) => x._id !== u._id);
  } catch (e) {
    alert(e?.response?.data?.message || e.message);
  }
}

onMounted(async () => {
  await auth.bootstrap();
  await fetchUsers();
});
</script>
