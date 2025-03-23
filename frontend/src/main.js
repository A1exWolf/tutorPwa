import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth";
import { registerSW } from "virtual:pwa-register";

import App from "./App.vue";
import router from "./router";

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New content available, click on reload button to update.");
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Check authentication status after app is mounted
app.mount("#app");
const authStore = useAuthStore();
authStore.checkAuth().catch(console.error);
