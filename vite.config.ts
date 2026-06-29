import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3012,
    // Прокси для API, чтобы избежать CORS-проблем при разработке
    proxy: {
      '/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Code Splitting — разбивка по страницам для слабого VPS
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
        },
      },
    },
    // Минимизация для продакшена
    minify: 'terser',
    sourcemap: false,
  },
});
