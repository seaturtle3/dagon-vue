import LoginView from '@/views/auth/login/Login.vue';
import RegisterView from '@/views/auth/register/RegisterView.vue';

export default [
    {
        path: '/login',
        component: LoginView,
        meta: { layout: 'auth' } // 필요 시 레이아웃 구분용
    },
    {
        path: '/register',
        component: RegisterView,
        meta: { layout: 'auth' }
    }
];