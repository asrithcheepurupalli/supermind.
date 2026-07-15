import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Relative base so the build runs from any host or subpath (GitHub Pages, etc).
  base: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
