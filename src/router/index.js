import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/home/Home.vue'
import Product from '@/views/product/Product.vue'
import FishingCenter from '@/views/community/fishing-center/FishingCenter.vue'
import Sea from '@/views/fishing-filter/Sea.vue'
import Freshwater from '@/views/fishing-filter/Freshwater.vue'
import Community from '@/views/community/Community.vue'
import CustomerService from '@/views/support/customer-service/CustomerService.vue'
import ProductDetail from '@/views/community/fishing-center/ProductDetail.vue'
import inquiry from '@/views/inquiries/Inquiry.vue'
import Payment from '@/views/payments/Payment.vue'
import Reservation from '@/views/reservation/Reservation.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/fishing-center', component: FishingCenter },
    { path: '/fishing-center/product/:id', component: ProductDetail, name: 'ProductDetail' },
    { path: '/sea', component: Sea },
    { path: '/freshwater', component: Freshwater },
    { path: '/community', component: Community },
    { path: '/customer-service', component: CustomerService },
    { path: '/products', component: Product },
    { path: '/inquiry', component: () => import('@/views/inquiries/Inquiry.vue')},
    { path: '/payments', component: Payment },
    { path: '/reservation', component: Reservation },
    { path: '/notice', component: () => import('@/views/support/notice/NoticeList.vue') }, // 비동기
    { path: '/support/notice/:id', component: () => import('@/views/support/notice/NoticeDetail.vue'),
        props: true },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
