<template>
  <div v-if="showInstallPrompt" class="pwa-install-prompt">
    <div class="content">
      <p>Установить приложение?</p>
      <div class="buttons">
        <button @click="installPwa" class="install-btn">Установить</button>
        <button @click="dismissPrompt" class="dismiss-btn">Не сейчас</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const deferredPrompt = ref(null);
const showInstallPrompt = ref(false);

// Handle the beforeinstallprompt event
const handleBeforeInstallPrompt = (e) => {
  // Prevent Chrome 76+ from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt.value = e;
  // Show the install button
  showInstallPrompt.value = true;
};

// Install the PWA
const installPwa = async () => {
  if (!deferredPrompt.value) {
    return;
  }

  // Show the installation prompt
  deferredPrompt.value.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);

  // Clear the saved prompt since it can't be used again
  deferredPrompt.value = null;

  // Hide the install button
  showInstallPrompt.value = false;
};

// Dismiss the prompt
const dismissPrompt = () => {
  showInstallPrompt.value = false;
};

onMounted(() => {
  // Add event listener for beforeinstallprompt event
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  // Check if app is already installed
  window.addEventListener("appinstalled", () => {
    showInstallPrompt.value = false;
    console.log("PWA was installed");
  });
});

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
});
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 400px;
  padding: 16px;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.buttons {
  display: flex;
  gap: 12px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.install-btn {
  background-color: #4f46e5;
  color: white;
}

.dismiss-btn {
  background-color: #e5e7eb;
  color: #374151;
}
</style>
