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

                console.log(typeof res.data); // 'string' 이라면 문제!
                // console.log(res.data); // '{"token":"...","userInfo":{...}}'

                let data = res.data;
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        // 파싱 실패 시 에러 처리
                        throw new Error('서버 응답 파싱 오류');
                    }
                }
                const token = data.token;
                console.log('token------->: ', token)

                if (!token) {
                    this.error = data.message || '로그인에 실패했습니다.';
                    this.user = null;
                    this.isAuthenticated = false;
                    this.clearAuthData();
                    return false;
                }

                // 2. 토큰 저장
                localStorage.setItem('token', token);
                // console.log('res.data------->: ', res.data)
                const userInfo = res.data.userInfo || {};
                localStorage.setItem('userInfo', JSON.stringify({
                    uid: userInfo.uid,
                    uname: userInfo.uname,
                    profileImg: userInfo.profileImg,
                    uno: userInfo.uno
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
                console.log('토큰 갱신 시도...')
                
                // 현재 토큰이 있는지 확인
                const currentToken = localStorage.getItem('token')
                if (!currentToken) {
                    console.log('갱신할 토큰이 없습니다.')
                    return false
                }

                console.log('현재 토큰:', currentToken.substring(0, 20) + '...')

                // 토큰 갱신 요청
                const res = await axios.post('/api/auth/refresh', {}, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                })
                
                console.log('토큰 갱신 응답:', res.data)
                
                let data = res.data;
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        // 파싱 실패 시 에러 처리
                        throw new Error('서버 응답 파싱 오류');
                    }
                }
                const newToken = data.token
                
                if (newToken) {
                    console.log('토큰 갱신 성공')
                    localStorage.setItem('token', newToken)
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
                    
                    // adminAuthStore도 업데이트
                    const adminAuthStore = useAdminAuthStore()
                    adminAuthStore.setToken(newToken)
                    
                    return true
                } else {
                    console.log('새 토큰을 받지 못했습니다.')
                    return false
                }
            } catch (err) {
                console.error('토큰 갱신 실패:', err)
                console.error('에러 응답:', err.response?.data)
                
                // 401 에러가 아닌 경우에만 로그아웃
                if (err.response?.status !== 401) {
                    this.logout()
                }
                
                return false
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