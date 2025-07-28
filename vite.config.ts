import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  base: '/med-portal/', // Set the base path for deployment 
  // base: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/amrs': {
        target: 'https://ngx.ampath.or.ke',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/amrs/, '')
      }
    },
  },
});