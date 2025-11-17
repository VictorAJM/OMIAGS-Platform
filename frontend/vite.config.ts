import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",  // tu backend express
        changeOrigin: true,
        secure: false
      }
    }
  }
});
