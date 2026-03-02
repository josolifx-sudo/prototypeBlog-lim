<template>
  <div class="bg-anim" aria-hidden="true">
    <header class="topbar">
      <div class="topbar-inner">
        <router-link to="/" class="brand">
          <span class="dot" />
          <span>Strings</span>
        </router-link>

        <nav class="pillnav glass">
          <span class="pill" :style="pillStyle" aria-hidden="true"></span>

          <router-link ref="linkFeed" to="/" class="pilllink">Feed</router-link>

          <template v-if="auth.isLoggedIn">
            <router-link ref="linkProfile" to="/profile" class="pilllink">Profile</router-link>
            <router-link
              v-if="auth.isAdmin"
              ref="linkAdmin"
              to="/admin"
              class="pilllink"
            >
              Admin
            </router-link>
            <button class="pillbtn" @click="logout">Logout</button>
          </template>

          <template v-else>
            <router-link ref="linkLogin" to="/login" class="pilllink">Login</router-link>
            <router-link ref="linkRegister" to="/register" class="pilllink strong">Join</router-link>
          </template>
        </nav>
      </div>
    </header>

    <main class="container mainpad">
      <transition name="fade-up" mode="out-in">
        <router-view />
      </transition>
    </main>

    <footer class="footer container">
      <div class="muted">All rights reserved. 2026</div>
    </footer>
  </div>
</template>

<script>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

export default {
  name: "AppShell",
  setup() {
    const auth = useAuthStore();
    const route = useRoute();

    const linkFeed = ref(null);
    const linkProfile = ref(null);
    const linkAdmin = ref(null);
    const linkLogin = ref(null);
    const linkRegister = ref(null);

    const pillLeft = ref(8);
    const pillWidth = ref(60);

    function logout() {
      auth.logout();
      window.location.href = "/";
    }

    function getActiveEl() {
      const path = route.path;

      if (path.startsWith("/profile")) return linkProfile.value?.$el || linkProfile.value;
      if (path.startsWith("/admin")) return linkAdmin.value?.$el || linkAdmin.value;
      if (path.startsWith("/register")) return linkRegister.value?.$el || linkRegister.value;
      if (path.startsWith("/login")) return linkLogin.value?.$el || linkLogin.value;

      return linkFeed.value?.$el || linkFeed.value;
    }

    async function syncPill() {
      await nextTick();

      const nav = document.querySelector(".pillnav");
      const el = getActiveEl();
      if (!nav || !el) return;

      const navRect = nav.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      pillLeft.value = Math.max(6, elRect.left - navRect.left);
      pillWidth.value = Math.max(44, elRect.width);
    }

    const pillStyle = computed(() => ({
      transform: `translateX(${pillLeft.value}px)`,
      width: `${pillWidth.value}px`
    }));

    onMounted(async () => {
      if (auth.token && !auth.user) await auth.fetchMe();
      await syncPill();
    });

    watch(
      () => route.path,
      async () => {
        await syncPill();
      }
    );

    watch(
      () => auth.isLoggedIn,
      async () => {
        await syncPill();
      }
    );

    return {
      auth,
      logout,
      linkFeed,
      linkProfile,
      linkAdmin,
      linkLogin,
      linkRegister,
      pillStyle
    };
  }
};
</script>

<style scoped>
.topbar {
  position: sticky;
  min-height: var(--header-h);
  top: 0;
  z-index: 10;
  backdrop-filter: blur(14px);
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid var(--line);
}

.topbar-inner {
  width: min(980px, calc(100% - 32px));
  margin: 0 auto;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  box-shadow: 0 0 0 6px rgba(110, 231, 255, 0.10);
}

.pillnav {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.06);
}

.pill {
  position: absolute;
  left: 0;
  top: 6px;
  height: calc(100% - 12px);
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(110, 231, 255, 0.45),
    rgba(167, 139, 250, 0.40)
  );
  box-shadow: 0 0 12px rgba(110, 231, 255, 0.35);
  transition: transform 220ms ease, width 220ms ease;
  pointer-events: none;
}

.pilllink,
.pillbtn {
  position: relative;
  z-index: 1;
  padding: 10px 12px;
  border-radius: 999px;
  color: var(--muted);
  transition: color 160ms ease;
  font-weight: 750;
}

.pilllink.router-link-active {
  color: var(--text);
}

.pilllink.strong {
  color: var(--text);
}

.pillbtn {
  background: transparent;
  border: 0;
  cursor: pointer;
}

.footer {
  padding-top: 10px;
  padding-bottom: 30px;
}
.mainpad {
  padding-top: calc(var(--header-h) + 10px);
}
</style>