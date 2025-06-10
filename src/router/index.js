import {createRouter, createWebHistory} from 'vue-router'

const routes = [
    {path: '/', component: () => import('@/views/home/Home.vue')},

    // auth
    {path: '/login', component: () => import('@/views/auth/login/Login.vue')},
    {path: '/register', component: () => import('@/views/auth/register/components/RegisterForm.vue')},

    // pages
    {
        path: '/mypage',
        component: () => import('@/views/pages/my-page/MyPageView.vue'),
        redirect: '/mypage/profile',
        name: 'mypage',
        children: [
            {path: 'profile', component: () => import('@/views/pages/my-page/components/ProfileView.vue')},
            {path: 'password', component: () => import('@/views/pages/my-page/components/PasswordView.vue')},
            {path: 'points', component: () => import('@/views/pages/my-page/components/PointsView.vue')},
            {path: 'reservations', component: () => import('@/views/pages/my-page/components/ReservationsView.vue')},
            {path: 'notifications', component: () => import('@/views/pages/my-page/components/NotificationsView.vue')},
            {path: 'withdrawal', component: () => import('@/views/pages/my-page/components/WithdrawalView.vue')},
            {
                path: 'inquiries',
                name: 'mypage-inquiries',
                component: () => import('@/views/pages/my-page/components/InquiriesView.vue')
            },
        ]
    },

    // product
    {path: '/products', component: () => import('@/views/product/Product.vue')},
    {path: '/sea', component: () => import('@/views/fishing-filter/Sea.vue')},
    {path: '/freshwater', component: () => import('@/views/fishing-filter/Freshwater.vue')},

    // fishing-center
    {path: '/fishing-center', component: () => import('@/views/community/fishing-center/FishingCenter.vue')},
    {
        path: '/fishing-center/product/:id',
        component: () => import('@/views/community/fishing-center/ProductDetail.vue'),
        name: 'ProductDetail'
    },

    // order
    {path: '/payments', component: () => import('@/views/order/payment/Payment.vue')},
    {path: '/reservation', component: () => import('@/views/order/reservation/Reservation.vue')},

    // community
    {path: '/customer-service', component: () => import('@/views/support/customer-service/CustomerService.vue')},
    {path: '/community', component: () => import('@/views/community/Community.vue')},

    // support
    {path: '/notice', component: () => import('@/views/support/notice/NoticeList.vue')},
    {
        path: '/support/notice/:id', component: () => import('@/views/support/notice/NoticeDetail.vue'),
        props: true
    },
    {path: '/inquiry', component: () => import('@/views/support/inquiry/Inquiry.vue')},

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
