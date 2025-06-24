import axios from 'axios';
import { BASE_URL } from '@/constants/baseUrl.js'

// axios 인스턴스 생성
const instance = axios.create({
    baseURL: `${BASE_URL}`, // 스프링 부트 서버의 기본 주소
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 토큰 유효성 검사 함수
function validateToken(token) {
    if (!token) return false;
    
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.warn('잘못된 JWT 토큰 형식');
            return false;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
            console.warn('JWT 토큰이 만료됨');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('토큰 검증 실패:', error);
        return false;
    }
}

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
        // 토큰 가져오기 (localStorage 또는 sessionStorage에서)
        const token = localStorage.getItem('token');
        console.log('Current token:', token ? token.substring(0, 20) + '...' : 'No token');

        // 토큰이 있으면 유효성 검사 후 Authorization 헤더에 추가
        if (token) {
            if (validateToken(token)) {
                config.headers['Authorization'] = `Bearer ${token}`;
                console.log('Request headers:', config.headers);
            } else {
                console.warn('유효하지 않은 토큰 발견, 토큰 제거');
                localStorage.removeItem('token');
                // 토큰이 유효하지 않으면 요청을 중단하고 로그인 페이지로 리다이렉트
                window.location.href = '/login';
                return Promise.reject(new Error('유효하지 않은 토큰'));
            }
        } else {
            console.warn('No token found in localStorage');
        }

        // FormData를 사용하는 경우 Content-Type 자동 설정
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // 서버가 응답을 반환한 경우
            console.error('API Error:', error.response.data);
            if (error.response.status === 401) {
                // 토큰이 만료되었거나 유효하지 않은 경우
                console.warn('401 에러 발생, 토큰 제거 및 로그인 페이지로 리다이렉트');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (error.response.status === 500 && error.response.data?.message?.includes('JWT signature')) {
                // JWT 서명 에러 처리
                console.error('JWT 서명 불일치 에러 발생');
                localStorage.removeItem('token');
                alert('인증 토큰에 문제가 있습니다. 다시 로그인해주세요.');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // 서버에 요청이 도달하지 못한 경우
            console.error('Network Error:', error.request);
        } else {
            // 요청 설정 중 오류가 발생한 경우
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance; 