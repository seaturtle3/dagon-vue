import {createRouter, createWebHistory} from 'vue-router'
import AdminLayout from '../views/pages/dashboard/AdminLayout.vue'

const routes = [
    {path: '/', component: () => import('@/views/home/Home.vue')},

    // auth
    {path: '/login', component: () => import('@/views/auth/login/Login.vue')},
    {path: '/register', component: () => import('@/views/auth/register/components/RegisterForm.vue')},
    {path: '/admin/login', component: () => import('@/views/auth/adminlogin/AdminLogin.vue')},
    {path: '/admin/register', component: () => import('@/views/auth/adminregister/AdminRegister.vue')},

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
            {path: 'inquiries', component: () => import('@/views/pages/my-page/components/InquiriesView.vue')}
        ]
    },
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {path: '', redirect: '/admin/dashboard'},
            {path: 'dashboard', component: () => import('@/views/pages/dashboard/components/Dashboard.vue'), meta: {requiresAuth: true}},
            {path: 'members', component: () => import('@/views/pages/dashboard/components/Members.vue'), meta: {requiresAuth: true}},
            {path: 'partners', component: () => import('@/views/pages/dashboard/components/Partners.vue'), meta: {requiresAuth: true}},
            {path: 'partner-applications', component: () => import('@/views/pages/dashboard/components/PartnerApplications.vue'), meta: {requiresAuth: true}},
            {path: 'reservations', component: () => import('@/views/pages/dashboard/components/Reservations.vue'), meta: {requiresAuth: true}},
            {path: 'notifications', component: () => import('@/views/pages/dashboard/components/Notifications.vue'), meta: {requiresAuth: true}},
            {path: 'reports', component: () => import('@/views/pages/dashboard/components/Reports.vue'), meta: {requiresAuth: true}},
            {path: 'events', component: () => import('@/views/pages/dashboard/components/Events.vue'), meta: {requiresAuth: true}},
            {path: 'notices', component: () => import('@/views/pages/dashboard/components/Notices.vue'), meta: {requiresAuth: true}},
            {path: 'faq', component: () => import('@/views/pages/dashboard/components/FAQ.vue'), meta: {requiresAuth: true}},
            {path: 'inquiries', component: () => import('@/views/pages/dashboard/components/Inquiries.vue'), meta: {requiresAuth: true}},
            {path: 'logout', component: () => import('@/views/pages/dashboard/components/Logout.vue'), meta: {requiresAuth: true}},
            {path: 'member/:uid', component: () => import('@/views/pages/dashboard/components/MemberDetail.vue'), meta: {requiresAuth: true}},
            {
                path: 'inquiries',
                name: 'mypage-inquiries',
                component: () => import('@/views/pages/my-page/components/InquiriesView.vue')
            },
        ]
    },

    // product
    {path: '/products', component: () => import('@/views/product/all-products/AllProducts.vue')},
    {path: '/products/sea', component: () => import('@/views/product/fishing-filter/Sea.vue')},
    {path: '/products/freshwater', component: () => import('@/views/product/fishing-filter/Freshwater.vue')},
    {
        path: '/products/product-detail/:id',
        name: 'ProductDetail',
        component: () => import('@/views/product/product-detail/ProductDetail.vue'),
    },

    // fishing-center
    {path: '/fishing-center', component: () => import('@/views/community/fishing-center/FishingCenter.vue')},

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

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const token = localStorage.getItem('token')
        if (!token) {
            next('/admin/login')
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
