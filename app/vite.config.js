import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import photoDates from "./vite-plugins/photoDates.js";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [react(), photoDates({ dir: "src/assets/evenements" })],
});