<template>
  <header class="bg-white shadow-md">
    <nav class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <router-link to="/" class="text-xl font-bold text-gray-800">
            Tutor App
          </router-link>

          <!-- Navigation items for authenticated users -->
          <template v-if="isAuthenticated">
            <router-link
              to="/tasks"
              class="px-3 py-2 rounded-md text-sm font-medium"
              :class="
                $route.path.startsWith('/tasks') &&
                $route.path !== '/tasks/create'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              "
            >
              Задания
            </router-link>

            <!-- Teacher specific navigation -->
            <template v-if="userRole === 'TEACHER'">
              <router-link
                to="/tasks/create"
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="
                  $route.path === '/tasks/create'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                "
              >
                Добавить задание
              </router-link>
            </template>

            <!-- Student specific navigation -->
            <template v-if="userRole === 'STUDENT'">
              <router-link
                to="/submissions"
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="
                  $route.path.startsWith('/submissions')
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                "
              >
                Решенные задания
              </router-link>
            </template>

            <router-link
              to="/profile"
              class="px-3 py-2 rounded-md text-sm font-medium"
              :class="
                $route.path === '/profile'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              "
            >
              Личный кабинет
            </router-link>
          </template>
        </div>

        <!-- Authentication buttons -->
        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <span class="text-sm text-gray-700 mr-3">
              {{ authStore.user.firstName }} {{ authStore.user.lastName }}
              <span class="text-xs text-gray-500 ml-1"
                >({{ userRoleText }})</span
              >
            </span>
            <button
              @click="handleLogout"
              class="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Выйти
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="px-3 py-2 rounded-md text-sm font-medium"
              :class="
                $route.path === '/login'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              "
            >
              Войти
            </router-link>
            <router-link
              to="/register"
              class="ml-2 px-3 py-2 rounded-md text-sm font-medium"
              :class="
                $route.path === '/register'
                  ? 'bg-gray-900 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              "
            >
              Регистрация
            </router-link>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userRole = computed(() => authStore.user?.role);
const userRoleText = computed(() => {
  if (!authStore.user) return "";
  return authStore.user.role === "TEACHER" ? "Учитель" : "Студент";
});

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
};
</script>
