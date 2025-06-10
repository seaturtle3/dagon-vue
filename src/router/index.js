import {createRouter, createWebHistory} from 'vue-router'
import AdminLayout from '../views/admin/AdminLayout.vue'

const routes = [
    {path: '/', component: () => import('@/views/home/Home.vue')},
    {path: '/fishing-center', component: () => import('@/views/community/fishing-center/FishingCenter.vue')},
    {path: '/fishing-center/product/:id', component: () => import('@/views/community/fishing-center/ProductDetail.vue')},
    {path: '/products', component: () => import('@/views/product/Product.vue')},
    {path: '/sea', component: () => import('@/views/fishing-filter/Sea.vue')},
    {path: '/freshwater', component: () => import('@/views/fishing-filter/Freshwater.vue')},
    {path: '/community', component: () => import('@/views/community/Community.vue')},
    {path: '/customer-service', component: () => import('@/views/support/customer-service/CustomerService.vue')},
    {path: '/inquiry', component: () => import('@/views/support/inquiry/Inquiry.vue')},
    {path: '/payments', component: () => import('@/views/order/payment/Payment.vue')},
    {path: '/reservation', component: () => import('@/views/order/reservation/Reservation.vue')},
    {path: '/notice', component: () => import('@/views/support/notice/NoticeList.vue')},
    {path: '/support/notice/:id', component: () => import('@/views/support/notice/NoticeDetail.vue'), props: true},
    {path: '/login', component: () => import('@/views/auth/login/Login.vue')},
    {path: '/register', component: () => import('@/views/auth/register/components/RegisterForm.vue')},
    {path: '/admin/login', component: () => import('@/views/auth/adminlogin/AdminLogin.vue')},
    {path: '/admin/register', component: () => import('@/views/auth/adminregister/AdminRegister.vue')},
    {
        path: '/mypage',
        component: () => import('@/views/pages/my-page/MyPageView.vue'),
        redirect: '/mypage/profile',
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
            {path: 'dashboard', component: () => import('@/views/admin/components/Dashboard.vue'), meta: {requiresAuth: true}},
            {path: 'members', component: () => import('@/views/admin/components/Members.vue'), meta: {requiresAuth: true}},
            {path: 'partners', component: () => import('@/views/admin/components/Partners.vue'), meta: {requiresAuth: true}},
            {path: 'partner-applications', component: () => import('@/views/admin/components/PartnerApplications.vue'), meta: {requiresAuth: true}},
            {path: 'reservations', component: () => import('@/views/admin/components/Reservations.vue'), meta: {requiresAuth: true}},
            {path: 'notifications', component: () => import('@/views/admin/components/Notifications.vue'), meta: {requiresAuth: true}},
            {path: 'reports', component: () => import('@/views/admin/components/Reports.vue'), meta: {requiresAuth: true}},
            {path: 'events', component: () => import('@/views/admin/components/Events.vue'), meta: {requiresAuth: true}},
            {path: 'notices', component: () => import('@/views/admin/components/Notices.vue'), meta: {requiresAuth: true}},
            {path: 'faq', component: () => import('@/views/admin/components/FAQ.vue'), meta: {requiresAuth: true}},
            {path: 'inquiries', component: () => import('@/views/admin/components/Inquiries.vue'), meta: {requiresAuth: true}},
            {path: 'logout', component: () => import('@/views/admin/components/Logout.vue'), meta: {requiresAuth: true}},
            {path: 'member/:uid', component: () => import('@/views/admin/components/MemberDetail.vue'), meta: {requiresAuth: true}}
        ]
    }
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
