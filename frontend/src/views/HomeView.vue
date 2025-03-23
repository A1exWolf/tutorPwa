<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900 mb-6">
      Добро пожаловать в Tutor App
    </h1>
    <p class="text-xl text-gray-600 mb-8">
      Платформа для взаимодействия учителей и учеников
    </p>
    <div class="space-x-4">
      <template v-if="!isAuthenticated">
        <router-link
          to="/login"
          class="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Войти
        </router-link>
        <router-link
          to="/register"
          class="inline-block px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Регистрация
        </router-link>
      </template>
      <template v-else>
        <router-link
          to="/tasks"
          class="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Перейти к заданиям
        </router-link>
        <router-link
          to="/profile"
          class="inline-block px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Личный кабинет
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>
