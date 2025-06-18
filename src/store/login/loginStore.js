import { defineStore } from 'pinia';
import axios from '@/lib/axios';
import { useAdminAuthStore} from "@/store/auth/auth.js";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
    }),

    getters: {
        getUser: (state) => state.user,
        isLoggedIn: (state) => state.isAuthenticated,
        getLoading: (state) => state.loading,
        getError: (state) => state.error
    },

    actions: {
        async login(uid, upw) {
            this.loading = true;
            this.error = null;
            
            try {
                // 1. 로그인 요청
                const res = await axios.post('/api/auth/login', { uid, upw });
                const token = res.data.token;

                if (!token) {
                    throw new Error('토큰이 없습니다.');
                }

                // 2. 토큰 저장
                localStorage.setItem('token', token);
                localStorage.setItem('userInfo', JSON.stringify({
                    uid: res.data.uid,
                    uname: res.data.uname,
                    profileImg: res.data.profileImg,
                    uno: res.data.uno
                }));

                // 3. 토큰을 Authorization 헤더에 설정
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // 4. 사용자 정보 요청
                const userRes = await axios.get('/api/users/me');
                this.user = userRes.data;
                this.isAuthenticated = true;

                // 5. authStore에 값 연동
                const adminAuthStore = useAdminAuthStore();
                adminAuthStore.setToken(token);
                adminAuthStore.setUser({
                    uid: userRes.data.uid,
                    name: userRes.data.uname,
                    profileImage: userRes.data.profileImg,
                    uno: userRes.data.uno
                });

                return true;
            } catch (err) {
                console.error('로그인 실패', err);
                this.error = err.response?.data?.message || '로그인에 실패했습니다.';
                this.user = null;
                this.isAuthenticated = false;
                this.clearAuthData();
                throw err;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.clearAuthData();
            this.user = null;
            this.isAuthenticated = false;
            this.error = null;
        },

        clearAuthData() {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            delete axios.defaults.headers.common['Authorization'];
        },

        async checkAuth() {
            const token = localStorage.getItem('token');
            const userInfo = localStorage.getItem('userInfo');
            
            if (!token || !userInfo) {
                this.logout();
                return false;
            }

            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const userRes = await axios.get('/api/users/me');
                
                this.user = userRes.data;
                this.isAuthenticated = true;

                // authStore에도 사용자 정보 업데이트
                const adminAuthStore = useAdminAuthStore();
                adminAuthStore.setToken(token);
                adminAuthStore.setUser({
                    uid: userRes.data.uid,
                    name: userRes.data.uname,
                    profileImage: userRes.data.profileImg,
                    uno: userRes.data.uno
                });

                return true;
            } catch (err) {
                console.error('인증 확인 실패', err);
                this.logout();
                return false;
            }
        },

        // 토큰 갱신
        async refreshToken() {
            try {
                const res = await axios.post('/api/auth/refresh');
                const newToken = res.data.token;
                
                if (newToken) {
                    localStorage.setItem('token', newToken);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    return true;
                }
                return false;
            } catch (err) {
                console.error('토큰 갱신 실패', err);
                this.logout();
                return false;
            }
        },

        // 토큰으로 사용자 정보 동기화 (OAuth 콜백 등에서 사용)
        async getUserInfo() {
            const token = localStorage.getItem('token');
            if (!token) {
                this.user = null;
                this.isAuthenticated = false;
                return;
            }
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const userRes = await axios.get('/api/users/me');
                this.user = userRes.data;
                this.isAuthenticated = true;
                // AdminAuthStore에도 동기화
                const adminAuthStore = useAdminAuthStore();
                adminAuthStore.setToken(token);
                adminAuthStore.setUser({
                    uid: userRes.data.uid,
                    name: userRes.data.uname,
                    profileImage: userRes.data.profileImg
                });
            } catch (err) {
                this.user = null;
                this.isAuthenticated = false;
                this.clearAuthData();
                throw err;
            }
        }
    },
});