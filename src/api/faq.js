import axios from 'axios'

// ✅ 사용자용
export const fetchFaqCategories = () => axios.get('/api/faq/categories')

export const fetchFaqList = (page = 0, size = 10) =>
    axios.get('/api/faq', {
        params: { page, size }
    })



// ✅ 관리자용
export const createFaq = (data) => axios.post('/api/admin/faq', data)
export const updateFaq = (id, data) => axios.put(`/api/admin/faq/${id}`, data)
export const deleteFaq = (id) => axios.delete(`/api/admin/faq/${id}`)
export const fetchAdminFaqCategories = () => axios.get('/api/admin/faq-categories')

