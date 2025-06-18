import {createRouter, createWebHistory} from 'vue-router'
import AdminLayout from '../views/pages/dashboard/AdminLayout.vue'

const routes = [
    {path: '/', component: () => import('@/views/home/Home.vue')},

    // auth
    {path: '/login', component: () => import('@/views/auth/login/Login.vue')},
    {path: '/register', component: () => import('@/views/auth/register/components/RegisterForm.vue')},
    {path: '/admin/login', component: () => import('@/views/auth/adminlogin/AdminLogin.vue')},
    {path: '/admin/register', component: () => import('@/views/auth/adminregister/AdminRegister.vue')},
    {path: '/oauth/callback', component: () => import('@/views/auth/oauth/OAuthCallback.vue')},
    {path: '/additional-info', component: () => import('@/views/auth/oauth/AdditionalInfoForm.vue')},

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
            {
                path: 'dashboard',
                component: () => import('@/views/pages/dashboard/components/Dashboard.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'members',
                component: () => import('@/views/pages/dashboard/components/Members.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'partners',
                component: () => import('@/views/pages/dashboard/components/Partners.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'partner-applications',
                component: () => import('@/views/pages/dashboard/components/PartnerApplications.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'reservations',
                component: () => import('@/views/pages/dashboard/components/Reservations.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'notifications',
                component: () => import('@/views/pages/dashboard/components/Notifications.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'reports',
                component: () => import('@/views/pages/dashboard/components/Reports.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'events',
                component: () => import('@/views/pages/dashboard/components/Events.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'notices',
                component: () => import('@/views/pages/dashboard/components/Notices.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'faq',
                component: () => import('@/views/pages/dashboard/components/FAQ.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'inquiries',
                component: () => import('@/views/pages/dashboard/components/Inquiries.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'inquiries/:id',
                name: 'AdminInquiryDetail',
                component: () => import('@/views/support/inquiry/components/MemberInquiry.vue'),
                props: true,
                meta: {requiresAuth: true}
            },
            {
                path: 'logout',
                component: () => import('@/views/pages/dashboard/components/Logout.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'member/:uid',
                component: () => import('@/views/pages/dashboard/components/MemberDetail.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'inquiries',
                name: 'mypage-inquiries',
                component: () => import('@/views/pages/my-page/components/InquiriesView.vue')
            },
        ]
    },

    // partner pages
    {
        path: '/partner',
        component: () => import('@/views/pages/partner-page/PartnerPage.vue'),
        redirect: '/partner/dashboard',
        meta: {requiresAuth: true},
        children: [
            {path: 'dashboard', component: () => import('@/views/pages/partner-page/components/Dashboard.vue')},
            {path: 'info', component: () => import('@/views/pages/partner-page/components/PartnerInfo.vue')},
            {path: 'inquiries', component: () => import('@/views/pages/partner-page/components/InquiryList.vue')},
            {
                path: 'reservations',
                component: () => import('@/views/pages/partner-page/components/ReservationList.vue')
            },
            {
                path: 'reservations/:id',
                component: () => import('@/views/pages/partner-page/components/ReservationDetail.vue')
            },
            {path: 'products', component: () => import('@/views/pages/partner-page/components/ProductList.vue')},
            {
                path: 'market-info',
                component: () => import('@/views/pages/partner-page/components/FishingReportManager.vue')
            },
            {
                path: 'market-info/:id',
                component: () => import('@/views/pages/partner-page/components/FishingReportDetail.vue')
            },
            {path: 'withdrawal', component: () => import('@/views/pages/partner-page/components/PartnerWithdrawal.vue')}
        ]
    },

    {
        path: '/partner/apply',
        component: () => import('@/views/auth/partner/components/PartnerApplicationForm.vue')
    },
    {
        path: '/partner/applications',
        component: () => import('@/views/auth/partner/PartnerApplicationList.vue')
    },

    // product
    {
        path: '/products',
        children: [
            {path: '', component: () => import('@/views/product/all-products/ProductList.vue')},
            {path: 'form', component: () => import('@/views/product/all-products/ProductForm.vue')},
            {path: 'sea', component: () => import('@/views/product/fishing-filter/Sea.vue')},
            {path: 'freshwater', component: () => import('@/views/product/fishing-filter/Freshwater.vue')},
            {
                path: ':prodId',
                name: 'ProductDetail',
                component: () => import('@/views/product/product-detail/ProductDetail.vue'),
            },
        ]
    },

    // fishing-center
    {path: '/fishing-center', component: () => import('@/views/community/fishing-center/FishingCenter.vue')},
    {
        path: '/fishing-report',
        children: [
            {path: '', component: () => import('@/views/community/fishing-report/ReportList.vue')},
            {path: 'form', component: () => import('@/views/community/fishing-report/ReportForm.vue')},
            {
                path: ':frId',
                name: 'ReportDetail',
                component: () => import('@/views/community/fishing-report/ReportDetail.vue'),
                props: true, // <--- 이걸 해야 route.params.id를 prop으로 받을 수 있어},
            },
        ]
    },

    {
        path: '/fishing-diary',
        children: [
            {path: '', component: () => import('@/views/community/fishing-diary/DiaryList.vue')},
            // {path: 'form', component: () => import('@/views/community/fishing-diary/DiaryList/DiaryForm.vue')},
            {
                path: ':fdId',
                name: 'DiaryDetail',
                component: () => import('@/views/community/fishing-diary/DiaryDetail.vue'),
                props: true,
            },
        ]
    },


    // order
    {path: '/payments', component: () => import('@/views/order/payment/Payment.vue')},
    {
        path: '/reservation-confirm',
        component: () => import('@/views/order/reservation/components/ReservationConfirm.vue')
    },
    {path: '/reservation-form', component: () => import('@/views/order/reservation/components/ReservationForm.vue')},
    {
        path: '/reservation/:prodId',
        name: 'Reservation',
        component: () => import('@/views/order/reservation/ReservationMain.vue'),
        props: true
    },

    // community
    {path: '/customer-service', component: () => import('@/views/support/customer-service/CustomerService.vue')},
    {path: '/community', component: () => import('@/views/community/Community.vue')},

    // support
    {path: '/notice', component: () => import('@/views/support/notice/NoticeList.vue')},
    {
        path: '/notice/write',
        component: () => import('@/views/support/notice/NoticeWrite.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/notice/edit/:id',
        component: () => import('@/views/support/notice/NoticeWrite.vue'),
        props: true,
        meta: {requiresAuth: true}
    },
    {path: '/notice/:id', component: () => import('@/views/support/notice/NoticeDetail.vue'), props: true},

    {path: '/inquiry', component: () => import('@/views/support/inquiry/InquiryMain.vue')},

    {
        path: '/partner/product/list',
        name: 'PartnerProductList',
        component: () => import('@/views/pages/partner-page/components/ProductList.vue')
    },
    {
        path: '/partner/product/register',
        name: 'PartnerProductRegister',
        component: () => import('@/views/pages/partner-page/components/ProductRegister.vue')
    },
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
