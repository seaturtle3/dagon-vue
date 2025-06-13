import axios from '@/lib/axios'
import {useAdminAuthStore} from "@/store/auth/auth.js";

// 사용자용 API
export const fetchNotices = (params) => axios.get('/api/notices', {params})
export const fetchNoticeById = (id) => axios.get(`/api/notices/${id}`)

// 관리자용 API
export const createNotice = (data, token) => {
    return axios.post('/api/admin/notices', data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
}

export const updateNotice = (id, data) => axios.post(`/api/admin/notices/${id}`, data)
export const deleteNotice = (id) => axios.delete(`/api/admin/notices/${id}`)