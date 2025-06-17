import axiosInstance from '@/api/axios'

const API_URL = '/api'

export const reportApi = {
  // 상품 신고
  reportProduct(prodId, reason) {
    return axiosInstance.post(`${API_URL}/reports/product/${prodId}`, reason, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'text/plain'
      }
    })
  }
} 