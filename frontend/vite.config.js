import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-512x512.png",
        "screenshots/*.png",
      ],
      manifest: {
        name: "Tutor App",
        short_name: "Tutor",
        description: "Educational tutoring application",
        theme_color: "#4F46E5",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "screenshots/desktop-wide.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Homescreen of Tutor App",
          },
          {
            src: "screenshots/desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Overview of Tutor App",
          },
          {
            src: "screenshots/mobile.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Mobile view of Tutor App",
          },
          {
            src: "screenshots/tablet.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Tablet view of Tutor App",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
