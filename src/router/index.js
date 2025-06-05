import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/home/Home.vue'
import Product from '@/views/product/Product.vue'
import FishingCenter from "@/views/fishing-center/FishingCenter.vue";
import SeaFishing from '@/views/sea-fishing/SeaFishing.vue'
import FreshwaterFishing from '@/views/freshwater-fishing/FreshwaterFishing.vue'
import CustomerService from '@/views/support/customer-service/CustomerService.vue'
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
    { path: '/sea-fishing', component: SeaFishing },
    { path: '/freshwater-fishing', component: FreshwaterFishing },
    { path: '/community', component: Community },
    { path: '/customer-service', component: CustomerService },
    { path: '/products', component: Product },
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
