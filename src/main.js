import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css' // Bootstrap CSS
import 'bootstrap'                            // Bootstrap JS
import router from './router'

// 🔽 Font Awesome 관련 import 추가
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// import '@fortawesome/fontawesome-free/css/all.min.css';
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

// 🔽 아이콘 라이브러리에 아이콘 추가


library.add(fas, far)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 🔽 FontAwesome 컴포넌트 등록
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')