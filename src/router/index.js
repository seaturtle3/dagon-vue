import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import FishingReport from '@/views/FishingReport.vue'
import Product from '@/views/Product.vue'
import SeaFishing from '@/views/SeaFishing.vue'
import FreshwaterFishing from '@/views/FreshwaterFishing.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/fishing-report', component: FishingReport },
    { path: '/products', component: Product },
    { path: '/sea-fishing', component: SeaFishing },
    { path: '/freshwater-fishing', component: FreshwaterFishing },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
