import api from '@/lib/api'
import {useAdminAuthStore} from "@/store/auth/auth.js";


// 사용자용 API
export const fetchNotices = (params) => api.get('/api/notices', {params})
export const getNotices = (params) => api.get('/api/notices', {params})
export const fetchNoticeById = (id) => api.get(`/api/notices/${id}`)

// 관리자용 API
export const createNotice = (noticeData, token) => {
    return api.post('/api/admin/notices', noticeData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const updateNotice = (id, noticeData, token) => {
    return api.post(`/api/admin/notices/${id}`, noticeData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};


export const deleteNotice = (id, token) => {
    return api.delete(`/api/admin/notices/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}