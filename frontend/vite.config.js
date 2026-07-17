import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// In dev, proxy /api and /webhooks to the backend so there are no CORS issues
// and the frontend can call relative URLs.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/knowvato-main"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:4001", changeOrigin: true },
      "/webhooks": { target: "http://localhost:4001", changeOrigin: true },
    },
  },
});
