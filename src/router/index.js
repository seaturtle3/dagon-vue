import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/home/Home.vue'
import Product from '@/views/product/Product.vue'
import FishingCenter from '@/views/community/fishing-center/FishingCenter.vue'
import Sea from '@/views/fishing-filter/Sea.vue'
import Freshwater from '@/views/fishing-filter/Freshwater.vue'
import CustomerService from '@/views/support/customer-service/CustomerService.vue'
import ProductDetail from '@/views/community/fishing-center/ProductDetail.vue'
import Inquiry from '@/views/inquiries/Inquiry.vue'
import Payment from '@/views/reservation/Payment.vue'
import PaymentsList from '@/views/reservation/PaymentList.vue';
import inquiry from '@/views/inquiries/Inquiry.vue'
import Payment from '@/views/payments/Payment.vue'
import Reservation from '@/views/reservation/Reservation.vue'
import login from "@/views/auth/login/Login.vue";
import Community from "@/views/community/Community.vue";
import registerForm from "@/views/auth/register/components/RegisterForm.vue";
import MyPage from "@/views/mypage/MyPageView.vue";
import ProfileView from "@/views/mypage/components/ProfileView.vue";
import PasswordView from "@/views/mypage/components/PasswordView.vue";
import PointsView from "@/views/mypage/components/PointsView.vue";
import ReservationsView from "@/views/mypage/components/ReservationsView.vue";
import NotificationsView from "@/views/mypage/components/NotificationsView.vue";
import WithdrawalView from "@/views/mypage/components/WithdrawalView.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/fishing-center', component: FishingCenter },
    { path: '/fishing-center/product/:id', component: ProductDetail, name: 'ProductDetail' },
    { path: '/sea', component: Sea },
    { path: '/freshwater', component: Freshwater },
    { path: '/community', component: Community },
    { path: '/customer-service', component: CustomerService },
    { path: '/products', component: Product },
    { path: '/fishing-center/product/:id', component: ProductDetail, name: 'ProductDetail'},
    { path: '/inquiries', component: () => import('@/views/inquiries/Inquiry.vue')},
    { path: '/payments', component: Payment },
    { path: '/pay/list', component: PaymentsList },
    { path: '/reservation', component: Reservation },
    { path: '/inquiry', component: () => import('@/views/inquiries/Inquiry.vue')},
    { path: '/reservation', component: Reservation },
    { path: '/notice', component: () => import('@/views/support/notice/NoticeList.vue') }, // 비동기
    { path: '/support/notice/:id', component: () => import('@/views/support/notice/NoticeDetail.vue'),
        props: true },
    { path: '/login', component: login },
    { path: '/register', component: registerForm },
    {
        path: '/mypage',
        component: MyPage,
        redirect: '/mypage/profile',
        children: [
            {
                path: 'profile',
                component: ProfileView
            },
            {
                path: 'password',
                component: PasswordView
            },
            {
                path: 'points',
                component: PointsView
            },
            {
                path: 'reservations',
                component: ReservationsView
            },
            {
                path: 'notifications',
                component: NotificationsView
            },
            {
                path: 'withdrawal',
                component: WithdrawalView
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
