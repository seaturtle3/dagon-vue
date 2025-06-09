import {createRouter, createWebHistory} from 'vue-router'

const routes = [
    {path: '/', component: () => import('@/views/home/Home.vue')},
    {path: '/fishing-center', component: () => import('@/views/community/fishing-center/FishingCenter.vue')},
    {
        path: '/fishing-center/product/:id',
        component: () => import('@/views/community/fishing-center/ProductDetail.vue'),
        name: 'ProductDetail'
    },
    {path: '/sea', component: () => import('@/views/fishing-filter/Sea.vue')},
    {path: '/freshwater', component: () => import('@/views/fishing-filter/Freshwater.vue')},
    {path: '/community', component: () => import('@/views/community/Community.vue')},
    {path: '/customer-service', component: () => import('@/views/support/customer-service/CustomerService.vue')},
    {path: '/products', component: () => import('@/views/product/Product.vue')},
    {path: '/inquiry', component: () => import('@/views/inquiries/Inquiry.vue')},
    {path: '/payments', component: () => import('@/views/reservation/Payment.vue')},
    {path: '/reservation', component: () => import('@/views/reservation/Reservation.vue')},
    {path: '/notice', component: () => import('@/views/support/notice/NoticeList.vue')},
    {
        path: '/support/notice/:id', component: () => import('@/views/support/notice/NoticeDetail.vue'),
        props: true
    },
    {path: '/login', component: () => import('@/views/auth/login/Login.vue')},
    {path: '/register', component: () => import('@/views/auth/register/components/RegisterForm.vue')},
    {
        path: '/mypage',
        component: () => import('@/views/mypage/MyPageView.vue'),
        redirect: '/mypage/profile',
        name: 'mypage',
        children: [
            {path: 'profile', component: () => import('@/views/mypage/components/ProfileView.vue')},
            {path: 'password', component: () => import('@/views/mypage/components/PasswordView.vue')},
            {path: 'points', component: () => import('@/views/mypage/components/PointsView.vue')},
            {path: 'reservations', component: () => import('@/views/mypage/components/ReservationsView.vue')},
            {path: 'notifications', component: () => import('@/views/mypage/components/NotificationsView.vue')},
            {path: 'withdrawal', component: () => import('@/views/mypage/components/WithdrawalView.vue')},
            {path: 'inquiries', name: 'mypage-inquiries',component: () => import('@/views/mypage/components/InquiriesView.vue')},
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
