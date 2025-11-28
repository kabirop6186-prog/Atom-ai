import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// YOU CAN PASTE YOUR KEY HERE IF YOU CANNOT USE ENVIRONMENT VARIABLES
// Example: const MANUAL_API_KEY = "AIzaSy...";
const MANUAL_API_KEY = ""; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject the manual key or the environment key safely
    'process.env.API_KEY': JSON.stringify(MANUAL_API_KEY || process.env.API_KEY || '')
  },
  base: './', // CRITICAL for GitHub Pages: Use relative paths for assets
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});