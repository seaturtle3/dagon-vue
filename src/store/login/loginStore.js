import { defineStore } from 'pinia';
import axios from '@/lib/axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false,
    }),

    actions: {
        async login(uid, upw) {
            this.loading = true;
            try {
                // 1. 로그인 요청
                const res = await axios.post('/api/auth/login', { uid, upw });
                const token = res.data.token;

                // 2. 토큰 저장
                localStorage.setItem('token', token);

                // 3. 토큰을 Authorization 헤더에 설정
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // 4. 사용자 정보 요청
                const userRes = await axios.get('/api/users/me');
                this.user = userRes.data;
                this.isAuthenticated = true;
            } catch (err) {
                console.error('로그인 실패', err);
                this.user = null;
                this.isAuthenticated = false;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.user = null;
            this.isAuthenticated = false;
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        },

        async checkAuth() {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const userRes = await axios.get('/api/users/me');
                this.user = userRes.data;
                this.isAuthenticated = true;
            } catch (err) {
                this.logout();
            }
        },
    },
});