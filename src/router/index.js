import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/home/Home.vue';
import Product from '@/views/product/Product.vue';
import FishingCenter from '@/views/fishing-center/FishingCenter.vue';
import SeaFishing from '@/views/sea-fishing/SeaFishing.vue';
import FreshwaterFishing from '@/views/freshwater-fishing/FreshwaterFishing.vue';
import CustomerService from '@/views/support/customer-service/CustomerService.vue';

import authRoutes from './authRoutes'; // 로그인/회원가입 라우터 import

const routes = [
    { path: '/', component: Home },
    { path: '/products', component: Product },
    { path: '/fishing-center', component: FishingCenter },
    { path: '/sea-fishing', component: SeaFishing },
    { path: '/freshwater-fishing', component: FreshwaterFishing },
    { path: '/customer-service', component: CustomerService },
    ...authRoutes // auth 라우트 병합
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;