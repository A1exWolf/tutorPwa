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
            <router-link to="/tasks" class="text-gray-600 hover:text-gray-900">
              Задания
            </router-link>

            <!-- Teacher specific navigation -->
            <template v-if="userRole === 'TEACHER'">
              <router-link
                to="/tasks/create"
                class="text-gray-600 hover:text-gray-900"
              >
                Добавить задание
              </router-link>
            </template>

            <!-- Student specific navigation -->
            <template v-if="userRole === 'STUDENT'">
              <router-link
                to="/submissions"
                class="text-gray-600 hover:text-gray-900"
              >
                Решенные задания
              </router-link>
            </template>

            <router-link
              to="/profile"
              class="text-gray-600 hover:text-gray-900"
            >
              Личный кабинет
            </router-link>
          </template>
        </div>

        <!-- Authentication buttons -->
        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <button
              @click="handleLogout"
              class="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Выйти
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Войти
            </router-link>
            <router-link
              to="/register"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
};
</script>
