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
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
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
    port: 5173,
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
    // Vue 프록시 설정
    proxy: {
      // API 요청 프록시
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        // rewrite 제거 - /api 경로를 그대로 유지
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // 인증 관련 요청 프록시
      '/auth': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        // rewrite 제거 - /auth 경로를 그대로 유지
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('auth proxy error', err);
          });
        },
      },
      // 파일 업로드 프록시 (필요한 경우)
      '/uploads': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        // rewrite 제거 - /uploads 경로를 그대로 유지
      },
      // 웹소켓 프록시 (필요한 경우)
      '/ws': {
        target: API_TARGET.replace('https', 'wss'),
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    },
    // Vue Router fallback 설정
    configureServer: ({ middlewares }) => {
      middlewares.use(
        history({
          disableDotRule: true,
          htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
          rewrites: [
            // API 요청은 프록시로 처리
            { from: /^\/api\/.*$/, to: ctx => ctx.parsedUrl.pathname },
            { from: /^\/auth\/.*$/, to: ctx => ctx.parsedUrl.pathname },
            { from: /^\/uploads\/.*$/, to: ctx => ctx.parsedUrl.pathname },
            { from: /^\/ws\/.*$/, to: ctx => ctx.parsedUrl.pathname },
            // Vue 라우터 페이지들
            { from: /^\/login$/, to: '/index.html' },
            { from: /^\/register$/, to: '/index.html' },
            { from: /^\/mypage.*$/, to: '/index.html' },
            { from: /^\/admin.*$/, to: '/index.html' },
            { from: /^\/product.*$/, to: '/index.html' },
            { from: /^\/community.*$/, to: '/index.html' },
            { from: /^\/support.*$/, to: '/index.html' },
            { from: /^\/multtae.*$/, to: '/index.html' },
            { from: /^\/fishing.*$/, to: '/index.html' },
            { from: /^\/event.*$/, to: '/index.html' },
            { from: /^\/reservation.*$/, to: '/index.html' },
            { from: /^\/payment.*$/, to: '/index.html' },
            // 정적 파일들
            { from: /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/, to: ctx => ctx.parsedUrl.pathname },
            // 나머지는 모두 index.html로
            { from: /./, to: '/index.html' }
          ]
        })
      );
    }
  }
});
