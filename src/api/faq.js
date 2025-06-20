import axios from 'axios'

// ✅ 사용자용
export const fetchFaqCategories = () => axios.get('/api/faq/categories')

export const fetchFaqList = (params) =>
    axios.get('/api/faq', { params })



// ✅ 관리자용
export const updateFaq = (id, data) =>
    axios.put(`/api/admin/faq/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })

export const createFaq = (data) =>
    axios.post(`/api/admin/faq`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
export const deleteFaq = (id) => axios.delete(`/api/admin/faq/${id}`)
export const fetchFaqDetail = (id) => axios.get(`/api/admin/faq/${id}`) // ← 이 부분 추가
export const fetchAdminFaqCategories = () => axios.get('/api/admin/faq-categories')
