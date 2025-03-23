<script setup>
import { RouterLink, RouterView } from "vue-router";
import Header from "./components/Header.vue";
import PwaInstallPrompt from "./components/PwaInstallPrompt.vue";
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.checkAuth();
  } catch (error) {
    console.error("Authentication check failed:", error);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    <main class="container mx-auto py-8 px-4">
      <router-view />
    </main>
    <PwaInstallPrompt />
  </div>
</template>

<style>
/* Add any global styles here */
</style>
