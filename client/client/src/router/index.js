import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import FeedPage from "../pages/FeedPage.vue";
import PostPage from "../pages/PostPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import AdminPage from "../pages/AdminPage.vue";
import NotFound from "../pages/NotFound.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "feed", component: FeedPage },
    { path: "/posts/:id", name: "post", component: PostPage },
    { path: "/login", name: "login", component: LoginPage, meta: { guestOnly: true } },
    { path: "/register", name: "register", component: RegisterPage, meta: { guestOnly: true } },
    { path: "/profile", name: "profile", component: ProfilePage, meta: { authOnly: true } },
    { path: "/admin", name: "admin", component: AdminPage, meta: { authOnly: true, adminOnly: true } },
    { path: "/:pathMatch(.*)*", name: "notfound", component: NotFound }
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.token && !auth.user) {
    await auth.bootstrap();
  }

  if (to.meta.authOnly && !auth.token) {
    return { name: "login", query: { next: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.token) {
    return { name: "feed" };
  }

  if (to.meta.adminOnly && !auth.user?.isAdmin) {
    return { name: "feed" };
  }

  return true;
});

export default router;
