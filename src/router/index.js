import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/home/Home.vue'
import Product from '@/views/product/Product.vue'
import FishingCenter from "@/views/community/fishing-center/FishingCenter.vue";
import SeaFishing from '@/views/fishing-filter/sea-fishing/SeaFishing.vue'
import FreshwaterFishing from '@/views/fishing-filter/fresh-water-fishing/FreshwaterFishing.vue'
import Community from '@/views/community/Community.vue'
import CustomerService from '@/views/support/customer-service/CustomerService.vue'
import ProductDetail from '@/views/community/fishing-center/ProductDetail.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/fishing-center', component: FishingCenter },
    { path: '/sea-fishing', component: SeaFishing },
    { path: '/freshwater-fishing', component: FreshwaterFishing },
    { path: '/community', component: Community},
    { path: '/customer-service', component: CustomerService },
    { path: '/products', component: Product },
    { path: '/fishing-center/product/:id', component: ProductDetail, name: 'ProductDetail'}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
