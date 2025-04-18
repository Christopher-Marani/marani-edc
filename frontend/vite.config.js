import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@aws-amplify/api'], // Ensure Vite pre-bundles this dependency during development
  },
  build: {
    rollupOptions: {
      external: [], // Ensure @aws-amplify/api is not externalized
    },
  },
  server: {
    port: 5173
  }
});