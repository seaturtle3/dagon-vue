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

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
        // 토큰 가져오기 (localStorage 또는 sessionStorage에서)
        const token = localStorage.getItem('token'); // 또는 sessionStorage.getItem('token')
        console.log('Current token:', token); // 디버깅용 로그

        // 토큰이 있으면 Authorization 헤더에 추가
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Request headers:', config.headers); // 디버깅용 로그
        } else {
            console.warn('No token found in localStorage'); // 디버깅용 로그
        }

        // FormData를 사용하는 경우 Content-Type 자동 설정
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error); // 디버깅용 로그
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
                localStorage.removeItem('token');
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