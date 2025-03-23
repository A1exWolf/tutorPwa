import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Check authentication status after app is mounted
app.mount("#app");
const authStore = useAuthStore();
authStore.checkAuth().catch(console.error);
