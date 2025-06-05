import axios from '@/lib/axios'

// 사용자용 API
export const fetchNotices = (params) => axios.get('/api/notices', {params})
export const fetchNoticeById = (id) => axios.get(`/api/notices/${id}`)

// 관리자용 API
export const createNotice = (data) => axios.post('/api/admin/notices', data)
export const updateNotice = (id, data) => axios.put(`/api/admin/notices/${id}`, data)
export const deleteNotice = (id) => axios.delete(`/api/admin/notices/${id}`)