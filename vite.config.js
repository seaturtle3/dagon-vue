import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import history from 'connect-history-api-fallback'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'

// 환경변수로 백엔드 URL 설정
// const API_TARGET = process.env.VITE_API_TARGET || 'https://localhost:8097';
const API_TARGET = 'https://docs.yi.or.kr:8097';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // basicSsl() // ✅ HTTPS 인증서 적용 (개발 환경에서 자체 서명 인증서 사용)
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      global: 'globalThis'
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      plugins: [nodePolyfills()]
    }
  },
  server: {
    port: 25173,
    host: '0.0.0.0',
    open: false,
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem')
    },
    cors: true,
    fs: {
      strict: false
    },
    hmr: {
      host: 'docs.yi.or.kr',
      port: 25173,
      protocol: 'wss'
    },
    proxy: {
      // API 요청만 백엔드로 프록시
      '/api': {
        target: 'https://docs.yi.or.kr:8097',
        changeOrigin: true,
        secure: false, // 자체 서명 인증서 허용(개발용)
        ws: false
      },
      '/api-docs': {
        target: 'https://docs.yi.or.kr:8097',
        changeOrigin: true,
        secure: false,
        ws: false
      },
      '/auth': {
        target: 'https://docs.yi.or.kr:8097',
        changeOrigin: true,
        secure: false,
        ws: false
      }
    },
    // ✅ 여기서 Vue Router fallback 적용!
    configureServer: ({ middlewares }) => {
      middlewares.use(
          history({
            disableDotRule: true,
            htmlAcceptHeaders: ['text/html','application/xhtml+xml'],
            rewrites: [
              { from: /^\/login$/, to: '/index.html' },
              { from: /^\/mypage.*$/, to: '/index.html' },
              { from: /^\/api\/.*$/, to: ctx => ctx.parsedUrl.pathname },
              { from: /^\/auth\/.*$/, to: ctx => ctx.parsedUrl.pathname },
              { from: /./, to: '/index.html' }
            ]
          })
      );
    }
  }

});
