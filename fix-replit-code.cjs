// fix-replit-code.js
const fs = require('fs');
const path = require('path');

// Overwrite vite.config.ts with a generic alias setup
const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});`;

fs.writeFileSync('vite.config.ts', viteConfig);
console.log('✅ Fixed vite.config.ts');
