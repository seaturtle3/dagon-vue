import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS 추가
import 'bootstrap'; // 선택: JS 기능 사용 시

const app = createApp(App)
const pinia = createPinia()          // Pinia 인스턴스 생성

app.use(pinia)
app.use(router)
app.mount('#app')
