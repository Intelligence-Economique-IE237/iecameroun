import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 5174 pour ne pas entrer en conflit avec le site public (5173)
  server: { port: 5174 },
  preview: { port: 5174 },
});
