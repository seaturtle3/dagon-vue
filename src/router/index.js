import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import FishingReport from '@/views/FishingReport.vue'
// import ProductList from '@/views/ProductList.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/fishing-report', component: FishingReport },
    // { path: '/products', component: ProductList }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
