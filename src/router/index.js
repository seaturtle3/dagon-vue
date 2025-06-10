import {createRouter, createWebHistory} from 'vue-router'
import AdminLayout from '../views/admin/AdminLayout.vue'
import Dashboard from '../views/admin/components/Dashboard.vue'
import Members from '../views/admin/components/Members.vue'
import Partners from '../views/admin/components/Partners.vue'
import PartnerApplications from '../views/admin/components/PartnerApplications.vue'
import Reservations from '../views/admin/components/Reservations.vue'
import Notifications from '../views/admin/components/Notifications.vue'
import Reports from '../views/admin/components/Reports.vue'
import Events from '../views/admin/components/Events.vue'
import Notices from '../views/admin/components/Notices.vue'
import FAQ from '../views/admin/components/FAQ.vue'
import Inquiries from '../views/admin/components/Inquiries.vue'
import Logout from '../views/admin/components/Logout.vue'
import AdminLogin from '../views/auth/adminlogin/AdminLogin.vue'
import AdminRegister from '../views/auth/adminregister/AdminRegister.vue'
import MemberDetail from '@/views/admin/components/MemberDetail.vue'

const routes = [
    {path: '/', component: () => import('@/views/home/Home.vue')},
    {path: '/fishing-center', component: () => import('@/views/community/fishing-center/FishingCenter.vue')},
    {
        path: '/fishing-center/product/:id',
        component: () => import('@/views/community/fishing-center/ProductDetail.vue'),
        name: 'ProductDetail'
    },
    {path: '/products', component: () => import('@/views/product/Product.vue')},
    {path: '/sea', component: () => import('@/views/fishing-filter/Sea.vue')},
    {path: '/freshwater', component: () => import('@/views/fishing-filter/Freshwater.vue')},
    {path: '/community', component: () => import('@/views/community/Community.vue')},
    {path: '/customer-service', component: () => import('@/views/support/customer-service/CustomerService.vue')},
    {path: '/inquiry', component: () => import('@/views/support/inquiry/Inquiry.vue')},
    {path: '/payments', component: () => import('@/views/order/payment/Payment.vue')},
    {path: '/reservation', component: () => import('@/views/order/reservation/Reservation.vue')},
    {path: '/notice', component: () => import('@/views/support/notice/NoticeList.vue')},
    {
        path: '/support/notice/:id', component: () => import('@/views/support/notice/NoticeDetail.vue'),
        props: true
    },
    {path: '/login', component: () => import('@/views/auth/login/Login.vue')},
    {path: '/register', component: () => import('@/views/auth/register/components/RegisterForm.vue')},
    {path: '/admin/login', component: AdminLogin},
    {path: '/admin/register', component: AdminRegister},
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
            {path: 'inquiries', name: 'mypage-inquiries',component: () => import('@/views/pages/my-page/components/InquiriesView.vue')},
        ]
    },
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: '',
                redirect: '/admin/dashboard'
            },
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: Dashboard,
                meta: { requiresAuth: true }
            },
            {
                path: 'members',
                name: 'Members',
                component: Members,
                meta: { requiresAuth: true }
            },
            {
                path: 'partners',
                name: 'Partners',
                component: Partners,
                meta: { requiresAuth: true }
            },
            {
                path: 'partner-applications',
                name: 'PartnerApplications',
                component: PartnerApplications,
                meta: { requiresAuth: true }
            },
            {
                path: 'reservations',
                name: 'Reservations',
                component: Reservations,
                meta: { requiresAuth: true }
            },
            {
                path: 'notifications',
                name: 'Notifications',
                component: Notifications,
                meta: { requiresAuth: true }
            },
            {
                path: 'reports',
                name: 'Reports',
                component: Reports,
                meta: { requiresAuth: true }
            },
            {
                path: 'events',
                name: 'Events',
                component: Events,
                meta: { requiresAuth: true }
            },
            {
                path: 'notices',
                name: 'Notices',
                component: Notices,
                meta: { requiresAuth: true }
            },
            {
                path: 'faq',
                name: 'FAQ',
                component: FAQ,
                meta: { requiresAuth: true }
            },
            {
                path: 'inquiries',
                name: 'Inquiries',
                component: Inquiries,
                meta: { requiresAuth: true }
            },
            {
                path: 'logout',
                name: 'Logout',
                component: Logout,
                meta: { requiresAuth: true }
            },
            {
                path: 'member/:uid',
                component: MemberDetail
            }
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
