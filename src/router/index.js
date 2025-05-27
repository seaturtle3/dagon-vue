import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import FishingReport from '@/components/fishing-center/FishingReport.vue'
import FishingDiary from '@/components/fishing-center/FishingDiary.vue'
import Product from '@/views/Product.vue'
import SeaFishing from '@/views/SeaFishing.vue'
import FreshwaterFishing from '@/views/FreshwaterFishing.vue'
import Community from '@/views/Community.vue'
import CustomerService from '@/views/CustomerService.vue'
import FishingCenter from "@/views/FishingCenter.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/fishing-report', component: FishingReport },
    { path: '/fishing-diary', component: FishingDiary },
    { path: '/fishing-center', component: FishingCenter },
    { path: '/products', component: Product },
    { path: '/sea-fishing', component: SeaFishing },
    { path: '/freshwater-fishing', component: FreshwaterFishing },
    { path: '/community', component: Community },
    { path: '/customer-service', component: CustomerService },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
