import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, proxy /api and /webhooks to the backend so there are no CORS issues
// and the frontend can call relative URLs.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/webhooks": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
