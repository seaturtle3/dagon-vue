import axios from './axios';

const adminApi = axios.create({
  baseURL: 'http://localhost:8095/api/admin',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 설정
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminAuth = {
  // 관리자 로그인
  login: (loginData) => {
    return axios.post('/api/admin/login', loginData);
  },
  
  // 관리자 로그아웃
  logout: () => {
    localStorage.removeItem('token');
  },
  
  // 토큰 유효성 검사
  checkAuth: () => {
    return !!localStorage.getItem('token');
  }
};

export default adminApi; 