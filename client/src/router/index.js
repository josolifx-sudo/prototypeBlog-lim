import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import FeedPage from "../pages/FeedPage.vue";
import PostViewPage from "../pages/PostViewPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import AdminDashboardPage from "../pages/AdminDashboardPage.vue";
import NotFoundPage from "../pages/NotFoundPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "feed", component: FeedPage },
    { path: "/post/:id", name: "post", component: PostViewPage },

    { path: "/login", name: "login", component: LoginPage },
    { path: "/register", name: "register", component: RegisterPage },

    { path: "/profile", name: "profile", component: ProfilePage, meta: { requiresAuth: true } },
    { path: "/admin", name: "admin", component: AdminDashboardPage, meta: { requiresAuth: true, requiresAdmin: true } },

    { path: "/:pathMatch(.*)*", name: "notfound", component: NotFoundPage },
    {
      path: "/create",
      name: "create",
      component: () => import("../pages/CreatePostPage.vue")
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.token && !auth.user) {
    await auth.fetchMe();
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: "login" };
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: "feed" };
  }

  return true;
});

export default router;