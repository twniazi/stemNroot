import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/stemNroot/",   // <-- REQUIRED FOR GITHUB PAGES
  optimizeDeps: {
    exclude: ['lucide-react'], // <-- tumhari original setting safe
  },
});
