import axios from './axios';

const adminApi = axios.create({
  baseURL: 'http://localhost:8095/api/admin',
  headers: {
    'Content-Type': 'application/json'
  }
});


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

// 파트너 신청 관련 API
export const partnerApplicationApi = {
  // 파트너 신청 목록 조회
  getApplications: (page = 0, size = 10, keyword = '', type = '', status = '') => {
    return axios.get('/api/partners', {
      params: { page, size, keyword, type, status }
    });
  },

  // 파트너 신청 상세 조회
  getApplicationDetail: (id) => {
    return axios.get(`/api/partners/${id}`);
  },

  // 파트너 신청 승인
  approveApplication: (id) => {
    return axios.post(`/api/partners/${id}/approve`);
  },

  // 파트너 신청 반려
  rejectApplication: (id, reason) => {
    return axios.post(`/api/partners/${id}/reject`, { reason });
  }
};

export default adminApi; 