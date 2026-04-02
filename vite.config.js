// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@atoms":     path.resolve(__dirname, "./src/components/atoms"),
      "@molecules": path.resolve(__dirname, "./src/components/molecules"),
      "@organisms": path.resolve(__dirname, "./src/components/organisms"),
      "@pages":     path.resolve(__dirname, "./src/pages"),
      "@store":     path.resolve(__dirname, "./src/store"),
      "@services":  path.resolve(__dirname, "./src/services"),
      "@hooks":     path.resolve(__dirname, "./src/hooks"),
      "@theme":     path.resolve(__dirname, "./src/theme"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});