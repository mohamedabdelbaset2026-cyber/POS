
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // CRITICAL: Makes paths relative (e.g., ./assets/...) so they work in subfolders on GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
