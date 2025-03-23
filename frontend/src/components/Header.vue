<template>
  <header class="bg-white shadow-md">
    <nav class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <router-link to="/" class="text-xl font-bold text-gray-800">
            Tutor App
          </router-link>

          <!-- Mobile menu button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="ml-4 md:hidden text-gray-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <!-- Desktop navigation -->
        <div class="hidden md:flex md:items-center md:space-x-4">
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
        <div class="hidden md:flex md:items-center">
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
            <div class="flex space-x-2">
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
                class="px-3 py-2 rounded-md text-sm font-medium"
                :class="
                  $route.path === '/register'
                    ? 'bg-gray-900 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                "
              >
                Регистрация
              </router-link>
            </div>
          </template>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-show="isMobileMenuOpen"
        class="md:hidden mt-2 pt-2 border-t border-gray-200"
      >
        <div class="flex flex-col space-y-1">
          <!-- Navigation items for authenticated users -->
          <template v-if="isAuthenticated">
            <router-link
              to="/tasks"
              class="block px-3 py-2 rounded-md text-sm font-medium"
              :class="
                $route.path.startsWith('/tasks') &&
                $route.path !== '/tasks/create'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              "
              @click="isMobileMenuOpen = false"
            >
              Задания
            </router-link>

            <!-- Teacher specific navigation -->
            <template v-if="userRole === 'TEACHER'">
              <router-link
                to="/tasks/create"
                class="block px-3 py-2 rounded-md text-sm font-medium"
                :class="
                  $route.path === '/tasks/create'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                "
                @click="isMobileMenuOpen = false"
              >
                Добавить задание
              </router-link>
            </template>

            <!-- Student specific navigation -->
            <template v-if="userRole === 'STUDENT'">
              <router-link
                to="/submissions"
                class="block px-3 py-2 rounded-md text-sm font-medium"
                :class="
                  $route.path.startsWith('/submissions')
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                "
                @click="isMobileMenuOpen = false"
              >
                Решенные задания
              </router-link>
            </template>

            <router-link
              to="/profile"
              class="block px-3 py-2 rounded-md text-sm font-medium"
              :class="
                $route.path === '/profile'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              "
              @click="isMobileMenuOpen = false"
            >
              Личный кабинет
            </router-link>

            <div
              class="flex items-center justify-between mt-3 pt-2 border-t border-gray-200"
            >
              <span class="text-sm text-gray-700">
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
            </div>
          </template>
          <template v-else>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <router-link
                to="/login"
                class="px-3 py-2 text-center rounded-md text-sm font-medium"
                :class="
                  $route.path === '/login'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                "
                @click="isMobileMenuOpen = false"
              >
                Войти
              </router-link>
              <router-link
                to="/register"
                class="px-3 py-2 text-center rounded-md text-sm font-medium"
                :class="
                  $route.path === '/register'
                    ? 'bg-gray-900 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                "
                @click="isMobileMenuOpen = false"
              >
                Регистрация
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userRole = computed(() => authStore.user?.role);
const userRoleText = computed(() => {
  if (!authStore.user) return "";
  return authStore.user.role === "TEACHER" ? "Учитель" : "Студент";
});

const handleLogout = async () => {
  isMobileMenuOpen.value = false;
  await authStore.logout();
  router.push("/login");
};
</script>
