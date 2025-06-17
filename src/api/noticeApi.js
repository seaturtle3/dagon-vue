import axios from '@/lib/axios'
import {useAdminAuthStore} from "@/store/auth/auth.js";


// 사용자용 API
export const fetchNotices = (params) => axios.get('/api/notices', {params})
export const fetchNoticeById = (id) => axios.get(`/api/notices/${id}`)

// 관리자용 API
export const createNotice = (noticeData, token) => {
    return axios.post('/api/admin/notices', noticeData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const updateNotice = (id, noticeData, token) => {
    return axios.post(`/api/admin/notices/${id}`, noticeData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};


export const deleteNotice = (id, token) => {
    return axios.delete(`/api/admin/notices/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}