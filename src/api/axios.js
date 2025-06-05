import axios from 'axios';

// axios 인스턴스 생성
const instance = axios.create({
    baseURL: 'http://localhost:8095', // 스프링 부트 서버의 기본 주소
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
        // FormData를 사용하는 경우 Content-Type 자동 설정
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        return config;
    },
    (error) => {
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