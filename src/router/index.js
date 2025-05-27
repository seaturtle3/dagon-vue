import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import FishingReport from '@/views/FishingReport.vue'
import Product from '@/views/Product.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/fishing-report', component: FishingReport },
    { path: '/products', component: Product }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
