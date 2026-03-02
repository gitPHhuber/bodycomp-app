import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/react-router-dom")) return "router";
          if (id.includes("node_modules/recharts")) return "charts";
          if (id.includes("/src/admin/")) return "admin";
        },
      },
    },
  },
});
