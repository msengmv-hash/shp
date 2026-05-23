import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [".up.railway.app"],
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: [".up.railway.app"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
