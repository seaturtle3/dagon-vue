import api from '@/lib/axios'

// 사용자용 API
export const fetchNotices = (params) => api.get('/api/notices', {params})
export const getNotices = (params) => api.get('/api/notices', {params})
export const fetchNoticeById = (id) => api.get(`/api/notices/${id}`)

// 관리자용 API (토큰은 axios 인터셉터에서 자동 추가됨)
export const createNotice = (noticeData) => {
    return api.post('/api/admin/notices', noticeData);
};

export const updateNotice = (id, noticeData) => {
    return api.post(`/api/admin/notices/${id}`, noticeData);
};

export const deleteNotice = (id) => {
    return api.delete(`/api/admin/notices/${id}`);
};

// 관리자용 목록 조회 (사용자용 API와 동일하지만 관리자 권한 필요)
export const getAdminNotices = (params) => api.get('/api/notices', {params})