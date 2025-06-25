// loginStore.js - 캐시 문제 해결을 위한 주석 추가
import { defineStore } from 'pinia';
import api from '@/lib/axios';
import { useAdminAuthStore} from "@/store/auth/auth.js";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        selectedType: 'user' // 'user', 'partner', 'admin'
    }),

    getters: {
        getUser: (state) => state.user,
        isLoggedIn: (state) => state.isAuthenticated,
        getLoading: (state) => state.loading,
        getError: (state) => state.error,
        getSelectedType: (state) => state.selectedType
    },

    actions: {
        async login(uid, upw, type = 'user') {
            this.loading = true;
            this.error = null;
            this.selectedType = type;

            try {
                let loginEndpoint;
                let userInfoEndpoint;

                // 로그인 타입에 따라 엔드포인트 설정
                switch (type) {
                    case 'admin':
                        loginEndpoint = '/api/admin/login';
                        userInfoEndpoint = '/api/admin/me';
                        break;
                    case 'partner':
                        loginEndpoint = '/api/partner/login';
                        userInfoEndpoint = '/api/partner/me';
                        break;
                    case 'user':
                    default:
                        loginEndpoint = '/api/auth/login';
                        userInfoEndpoint = '/api/users/me';
                        break;
                }

                console.log(`로그인 시도 - 타입: ${type}, 엔드포인트: ${loginEndpoint}`);

                // 1. 로그인 요청
                const res = await api.post(loginEndpoint, { uid, upw });

                console.log('로그인 응답 전체:', res);
                console.log('응답 데이터 타입:', typeof res.data);
                console.log('응답 데이터:', res.data);

                const token = res.data.token;
                console.log('추출된 토큰:', token ? token.substring(0, 20) + '...' : '토큰 없음');

                if (!token) {
                    console.error('토큰이 없습니다. 응답 데이터:', res.data);
                    this.error = res.data.message || '로그인에 실패했습니다.';
                    this.user = null;
                    this.isAuthenticated = false;
                    this.clearAuthData();
                    return false;
                }

                // 2. 토큰 저장
                console.log('토큰을 localStorage에 저장 중...');
                localStorage.setItem('token', token);
                localStorage.setItem('loginType', type);

                // 저장 확인
                const savedToken = localStorage.getItem('token');
                const savedType = localStorage.getItem('loginType');
                console.log('저장된 토큰 확인:', savedToken ? savedToken.substring(0, 20) + '...' : '없음');
                console.log('저장된 타입 확인:', savedType);

                // 사용자 정보는 토큰에서 추출하거나 별도 요청으로 가져오기
                // JWT 토큰에서 사용자 정보 추출 시도
                let userInfo = {};
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log('JWT 페이로드:', payload);
                    userInfo = {
                        uid: payload.sub,
                        uname: payload.uname,
                        uno: payload.uno,
                        nickname: payload.nickname,
                        email: payload.email,
                        role: payload.role
                    };
                } catch (e) {
                    console.log('JWT 파싱 실패, 기본값 사용:', e);
                    userInfo = {
                        uid: 'unknown',
                        uname: '사용자',
                        uno: null
                    };
                }

                const userInfoToStore = {
                    ...userInfo,
                    type: type
                };
                console.log('저장할 사용자 정보:', userInfoToStore);
                localStorage.setItem('userInfo', JSON.stringify(userInfoToStore));

                // 3. 토큰을 Authorization 헤더에 설정
                console.log('axios 헤더에 토큰 설정 중...');
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('설정된 헤더:', api.defaults.headers.common['Authorization']);

                // 4. 사용자 정보는 JWT 토큰에서 추출한 정보 사용
                console.log('JWT에서 추출한 사용자 정보 사용');
                this.user = userInfo;
                this.isAuthenticated = true;

                // 5. authStore에 값 연동
                const adminAuthStore = useAdminAuthStore();
                adminAuthStore.setToken(token);
                adminAuthStore.setUser({
                    uid: userInfo.uid,
                    name: userInfo.uname,
                    profileImage: userInfo.profileImg || null,
                    uno: userInfo.uno,
                    type: type
                });

                console.log('로그인 완료! 인증 상태:', this.isAuthenticated);
                return true;
            } catch (err) {
                console.error('로그인 실패 상세:', err);
                console.error('에러 응답:', err.response?.data);
                console.error('에러 상태:', err.response?.status);
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
            this.selectedType = 'user';
        },

        clearAuthData() {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('loginType');
            delete api.defaults.headers.common['Authorization'];
        },

        async checkAuth() {
            const token = localStorage.getItem('token');
            const userInfo = localStorage.getItem('userInfo');
            const loginType = localStorage.getItem('loginType') || 'user';

            if (!token || !userInfo) {
                this.logout();
                return false;
            }

            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // 로그인 타입에 따라 다른 엔드포인트 사용
                let userInfoEndpoint;
                switch (loginType) {
                    case 'admin':
                        userInfoEndpoint = '/api/admin/me';
                        break;
                    case 'partner':
                        userInfoEndpoint = '/api/partner/me';
                        break;
                    case 'user':
                    default:
                        userInfoEndpoint = '/api/users/me';
                        break;
                }

                const userRes = await api.get(userInfoEndpoint);
                
                this.user = userRes.data;
                this.isAuthenticated = true;
                this.selectedType = loginType;

                // authStore에도 사용자 정보 업데이트
                const adminAuthStore = useAdminAuthStore();
                adminAuthStore.setToken(token);
                adminAuthStore.setUser({
                    uid: userRes.data.uid,
                    name: userRes.data.uname,
                    profileImage: userRes.data.profileImg,
                    uno: userRes.data.uno,
                    type: loginType
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
                const loginType = localStorage.getItem('loginType') || 'user'

                if (!currentToken) {
                    console.log('갱신할 토큰이 없습니다.')
                    return false
                }

                console.log('현재 토큰:', currentToken.substring(0, 20) + '...')
                console.log('로그인 타입:', loginType)

                // 로그인 타입에 따라 갱신 엔드포인트 설정
                let refreshEndpoint;
                switch (loginType) {
                    case 'admin':
                        refreshEndpoint = '/api/admin/refresh';
                        break;
                    case 'partner':
                        refreshEndpoint = '/api/partner/refresh';
                        break;
                    case 'user':
                    default:
                        refreshEndpoint = '/api/auth/refresh';
                        break;
                }

                // 토큰 갱신 요청
                const res = await api.post(refreshEndpoint, {}, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                })
                
                console.log('토큰 갱신 응답:', res.data)
                
                let responseData = res.data;
                if (typeof responseData === 'string') {
                    try {
                        responseData = JSON.parse(responseData);
                    } catch (e) {
                        // 파싱 실패 시 에러 처리
                        throw new Error('서버 응답 파싱 오류');
                    }
                }
                const newToken = responseData.token
                
                if (newToken) {
                    console.log('토큰 갱신 성공')
                    localStorage.setItem('token', newToken)
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
                    
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
            const loginType = localStorage.getItem('loginType') || 'user';

            if (!token) {
                this.user = null;
                this.isAuthenticated = false;
                return;
            }

            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // 로그인 타입에 따라 다른 엔드포인트 사용
                let userInfoEndpoint;
                switch (loginType) {
                    case 'admin':
                        userInfoEndpoint = '/api/admin/me';
                        break;
                    case 'partner':
                        userInfoEndpoint = '/api/partner/me';
                        break;
                    case 'user':
                    default:
                        userInfoEndpoint = '/api/users/me';
                        break;
                }

                const userRes = await api.get(userInfoEndpoint);
                this.user = userRes.data;
                this.isAuthenticated = true;
                this.selectedType = loginType;

                // AdminAuthStore에도 동기화
                const adminAuthStore = useAdminAuthStore();
                adminAuthStore.setToken(token);
                adminAuthStore.setUser({
                    uid: userRes.data.uid,
                    name: userRes.data.uname,
                    profileImage: userRes.data.profileImg,
                    uno: userRes.data.uno,
                    type: loginType
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