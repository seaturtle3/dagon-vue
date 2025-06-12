import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useProductDetailStore = defineStore('productDetailStore', {
    state: () => ({
        product: null,
        loading: false,
        error: null,
    }),
    actions: {
        async fetchProductDetail(productId) {
            this.loading = true
            this.error = null
            try {
                const res = await api.get(`/api/product/get/${productId}`)
                console.log('API 응답:', res.data)  // 이 줄 있으면 호출 완료 확인 가능
                this.product = res.data
            } catch (err) {
                console.error('Product detail fetch failed:', err)
                this.product = null
                this.error = err.response?.data?.message || '상품 정보를 불러올 수 없습니다.'
            } finally {
                this.loading = false
            }
        },

        clearProduct() {
            this.product = null
            this.error = null
        }
    }
})
