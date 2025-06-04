import axios from 'axios';

// Axios 인스턴스 생성 (기본 설정)
const apiClient = axios.create({
    baseURL: 'http://docs.yi.or.kr:8095/',
    // baseURL: 'http://localhost:8095/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
