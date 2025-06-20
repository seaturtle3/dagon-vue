import axios from 'axios'
import {BASE_URL} from "@/constants/baseUrl.js";

console.log('BASE_URL:', BASE_URL)

const api = axios.create({
    baseURL: BASE_URL || 'http://localhost:8095',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        // localStorage에서 토큰 가져와서 헤더에 추가
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        console.log('API 요청:', config.method?.toUpperCase(), config.url, config.data)
        console.log('요청 헤더:', config.headers)
        return config
    },
    (error) => {
        console.error('API 요청 에러:', error)
        return Promise.reject(error)
    }
)

// 응답 인터셉터
api.interceptors.response.use(
    (response) => {
        console.log('API 응답:', response.status, response.config.url, response.data)
        return response
    },
    (error) => {
        console.error('API 응답 에러:', error.response?.status, error.response?.data)
        
        // 401 에러 시 토큰 삭제 및 로그인 페이지로 리다이렉트
        if (error.response && error.response.status === 401) {
            console.log('인증 실패, 토큰 삭제 및 로그인 페이지로 이동')
            localStorage.removeItem('token')
            if (window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login'
            }
        }
        
        return Promise.reject(error)
    }
)

export default api