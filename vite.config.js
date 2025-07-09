import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import path from 'path';

// 환경변수로 백엔드 URL 설정 (Docker 환경에서는 'backend', 로컬에서는 'localhost')
const API_TARGET = process.env.VITE_API_TARGET || 'https://localhost:8097';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['localhost', '127.0.0.1', 'docs.yi.or.kr'],
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        // ws: true, // 필요시만 사용
        // rewrite: (path) => path.replace(/^\/api/, ''), // 필요시만 사용
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@views': path.resolve(__dirname, './src/views'),
    },
  },
});
