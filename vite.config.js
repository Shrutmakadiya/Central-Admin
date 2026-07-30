import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the backend during dev so there are no CORS surprises.
      '/api': 'http://localhost:4001',
      '/uploads': 'http://localhost:4001',
      '/privacy': 'http://localhost:4001',
      '/terms': 'http://localhost:4001',
    },
  },
});
