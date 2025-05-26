import { createRouter, createWebHistory } from 'vue-router'
import FishingReport from '@/views/FishingReport.vue'
import Product from '@/views/Product.vue'

const routes = [
    { path: '/fishing-report', component: FishingReport },
    { path: '/products', component: Product }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
