import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In production, add @originjs/vite-plugin-federation here to load remotes from
// each module's subdomain. For this reference shell we demonstrate the host
// shell, SSO and permission-aware navigation; remotes are loaded via the
// manifest (see src/ModuleHost.jsx) and documented in README.
export default defineConfig({
  plugins: [react()],
  server: { port: 5000, proxy: { "/api": { target: "http://localhost:4000", changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, "") } } },
});
