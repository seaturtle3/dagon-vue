import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/home/Home.vue'
import Product from '@/views/product/Product.vue'
import FishingCenter from '@/views/community/fishing-center/FishingCenter.vue'
import ProductDetail from '@/views/community/fishing-center/ProductDetail.vue'
import Sea from '@/views/fishing-filter/Sea.vue'
import Freshwater from '@/views/fishing-filter/Freshwater.vue'
import Community from '@/views/community/Community.vue'
import CustomerService from '@/views/support/customer-service/CustomerService.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/fishing-center', component: FishingCenter },
    { path: '/fishing-center/product/:id', component: ProductDetail, name: 'ProductDetail' },
    { path: '/sea', component: Sea },
    { path: '/freshwater', component: Freshwater },
    { path: '/community', component: Community },
    { path: '/customer-service', component: CustomerService },
    { path: '/products', component: Product },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
