import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Explicitly define the API key from the build environment.
    // Default to empty string if missing to prevent build crashes.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  base: './', // Use relative paths for assets to support flexible hosting
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});