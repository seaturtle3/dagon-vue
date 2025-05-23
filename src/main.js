import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS 추가
import 'bootstrap'; // 선택: JS 기능 사용 시
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')