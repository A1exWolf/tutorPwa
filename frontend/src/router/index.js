import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/tasks",
      name: "tasks",
      component: () => import("../views/TasksView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/tasks/create",
      name: "create-task",
      component: () => import("../views/CreateTaskView.vue"),
      meta: { requiresAuth: true, requiresTeacher: true },
    },
    {
      path: "/tasks/:id",
      name: "task-detail",
      component: () => import("../views/TaskDetailView.vue"),
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: "/submissions",
      name: "submissions",
      component: () => import("../views/SubmissionsView.vue"),
      meta: { requiresAuth: true, requiresStudent: true },
    },
    // {
    //   path: "/profile",
    //   name: "profile",
    //   component: () => import("../views/ProfileView.vue"),
    //   meta: { requiresAuth: true },
    // },
  ],
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  // Redirect authenticated users away from guest-only pages
  if (to.meta.requiresGuest && isAuthenticated) {
    next("/");
    return;
  }

  // Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
    return;
  }

  // Check role-based access
  if (to.meta.requiresTeacher && userRole !== "TEACHER") {
    next("/");
    return;
  }

  if (to.meta.requiresStudent && userRole !== "STUDENT") {
    next("/");
    return;
  }

  next();
});

export default router;
