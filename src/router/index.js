import {createRouter, createWebHistory} from 'vue-router'
import AdminLayout from '../views/pages/dashboard/AdminLayout.vue'

const routes = [
    {path: '/', component: () => import('@/views/home/Home.vue')},

    // multtae
    {path: '/multtae', component: () => import('@/views/multtae/MulttaeView.vue')},

    // auth
    {path: '/login', component: () => import('@/views/auth/login/Login.vue')},
    {path: '/register', component: () => import('@/views/auth/register/components/RegisterForm.vue')},
    {path: '/signup', component: () => import('@/views/auth/register/components/RegisterForm.vue')},
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
                component: () => import('@/views/pages/dashboard/components/AdminEvent.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'notices',
                component: () => import('@/views/pages/dashboard/components/AdminNotice.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'fishing-reports',
                component: () => import('@/views/pages/dashboard/components/FishingReports.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'fishing-diaries',
                component: () => import('@/views/pages/dashboard/components/FishingDiaries.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'fishing-diaries/:fdId',
                component: () => import('@/views/pages/dashboard/components/FishingDiaryDetail.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'fishing-reports/:frId/edit',
                component: () => import('@/views/pages/dashboard/components/FishingReportEdit.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'fishing-reports/:frId',
                component: () => import('@/views/pages/dashboard/components/FishingReportDetail.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'faq',
                component: () => import('@/views/pages/dashboard/components/AdminFAQ.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'inquiries',
                component: () => import('@/views/pages/dashboard/components/MemberInquiries.vue'),
                meta: {requiresAuth: true}
            },
            {
                path: 'guest-inquiries',
                component: () => import('@/views/pages/dashboard/components/GuestInquiries.vue'),
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
        name: 'PartnerPage',
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
            {path: 'products/form', component: () => import('@/views/pages/partner-page/ProductForm.vue')},
            {
                path: 'market-info',
                component: () => import('@/views/pages/partner-page/components/FishingReportManager.vue')
            },
            {
                path: 'market-info/:id',
                component: () => import('@/views/pages/partner-page/components/FishingReportDetail.vue'),
                props: route => ({ fr_id: route.params.id })
            },
            {path: 'withdrawal', component: () => import('@/views/pages/partner-page/components/PartnerWithdrawal.vue')},
            {
                path: 'fishing-diaries',
                component: () => import('@/views/pages/partner-page/components/FishingDiaryList.vue')
            },
            {
                path: 'fishing-diaries/:fd_id',
                component: () => import('@/views/pages/partner-page/components/FishingDiaryDetail.vue')
            },
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
            {path: 'sea', component: () => import('@/views/product/fishing-filter/Sea.vue')},
            {path: 'freshwater', component: () => import('@/views/product/fishing-filter/Freshwater.vue')},
            {
                path: ':prodId',
                name: 'ProductDetail',
                component: () => import('@/views/product/product-detail/ProductDetail.vue'),
            },
            {
                path: 'form',
                name: 'ProductCreate',
                component: () => import('@/views/product/all-products/ProductForm.vue')},
            {
                path: 'edit/:prodId',
                name: 'ProductEdit',
                component: () => import('@/views/product/all-products/ProductEditForm.vue'),
            },
        ]
    },

    // fishing-center
    {path: '/fishing-center', component: () => import('@/views/community/fishing-center/FishingCenter.vue')},
    {
        path: '/fishing-report',
        children: [
            {path: '', component: () => import('@/views/community/fishing-report/ReportList.vue')},
            {path: 'create', component: () => import('@/views/community/fishing-report/ReportForm.vue')},
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
        path: '/fishing-report/create',
        name: 'FishingReportCreate',
        component: () => import('@/views/community/fishing-report/ReportForm.vue')
    },
    {
        path: '/fishing-report/edit/:frId',
        name: 'FishingReportEdit',
        component: () => import('@/views/community/fishing-report/ReportForm.vue'),
        props: true
    },

    {
        path: '/fishing-diary',
        children: [
            {path: '', component: () => import('@/views/community/fishing-diary/DiaryList.vue')},
            {path: 'create', component: () => import('@/views/community/fishing-diary/DiaryForm.vue')},
            {
                path: ':fdId',
                name: 'DiaryDetail',
                component: () => import('@/views/community/fishing-diary/DiaryDetail.vue'),
                props: true,
            },
        ]
    },


    // order
    {path: '/payments', name: 'Payment', component: () => import('@/views/order/payment/Payment.vue')},
    {
        path: '/payments/result',
        name: 'PaymentResult',
        component: () => import('@/views/order/reservation/components/PaymentResult.vue')
    },
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
    // {
    //     path: '/order/reservation/form',
    //     name: 'ReservationForm',
    //     component: () => import('@/views/order/reservation/components/ReservationForm.vue'),
    //     props: route => ({ fishingAt: route.query.fishingAt }) // 💡 쿼리로 전달받음
    // },
    {path: '/reservation-calendar', component: () => import('@/components/calendar/ReservationCalendar.vue')},

    // community
    { path: '/event', component: () => import('@/views/community/event/EventList.vue') },
    {
        path: '/event/write',
        component: () => import('@/views/community/event/EventWrite.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/event/edit/:id',
        component: () => import('@/views/community/event/EventWrite.vue'),
        props: true,
        meta: { requiresAuth: true }
    },
    { path: '/event/:id', component: () => import('@/views/community/event/EventDetail.vue'), props: true },

    { path: '/community', component: () => import('@/views/community/Community.vue')},

    // support
    {path: '/customer-service', component: () => import('@/views/support/customer-service/CustomerService.vue')},
    {path: '/inquiry', component: () => import('@/views/support/inquiry/InquiryMain.vue')},
    {path: '/guest-inquiry', name: 'GuestInquiry', component: () => import('@/views/support/inquiry/components/GuestInquiry.vue')},
    {path: '/member-inquiry', name: 'MemberInquiry', component: () => import('@/views/support/inquiry/components/MemberInquiry.vue'), meta: {requiresAuth: true}},
    {path: '/faq', component: () => import('@/views/support/faq/FAQ.vue')},
    {path: '/notice', component: () => import('@/views/support/notice/NoticeList.vue')},
    {
        path: '/notice/:id',
        name: 'NoticeDetail',
        component: () => import('@/views/support/notice/NoticeDetail.vue'),
        props: true,
        meta: { noCache: true }
    },

    {path: '/memberInquiryModal', component: () => import('@views/support/inquiry/components/MemberInquiryModal.vue')},

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
    { path: '/product-inquiry', component: () => import('@/views/support/inquiry/ProductInquiry.vue') },

    // terms
    {
        path: '/terms',
        component: () => import('@/components/common/TermsView.vue')
    },
    {
        path: '/finance-terms',
        component: () => import('@/components/common/FinanceTermsView.vue')
    },
    {
        path: '/privacy-policy',
        component: () => import('@/components/common/PrivacyPolicyView.vue')
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
