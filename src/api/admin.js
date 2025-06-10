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

// 회원 관리 관련 API
export const memberApi = {
  // 회원 목록 조회
  getMembers: (page = 0, size = 10, search = '') => {
    return axios.get('/api/admin/users', {
      params: { page, size, search }
    });
  },

  // 회원 상세 정보 조회
  getMemberDetail: (uid) => {
    return axios.get(`/api/admin/user/${uid}`);
  },

  // 회원 정보 수정
  updateMember: (uno, memberData) => {
    return axios.put(`/api/admin/user/${uno}`, memberData);
  },

  // 회원 삭제
  deleteMember: (uno) => {
    return axios.delete(`/api/admin/user/${uno}`);
  },

  // 회원 비활성화
  deactivateMember: (uno) => {
    return axios.put(`/api/users/${uno}/deactivate`);
  },

  // 회원 활성화
  reactivateMember: (uno) => {
    return axios.put(`/api/users/${uno}/reactivate`);
  }
};

export default adminApi; 