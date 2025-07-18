import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useHomeProductStore = defineStore('homeProduct', {
    state: () => ({
        products: [],
        loading: false,
        error: null,
    }),
    actions: {
        async fetchRecommendedProducts() {
            this.loading = true
            this.error = null
            try {
                const res = await api.get('/api/product/get-all', {
                    params: {
                        page: 0,
                        size: 4, // 홈페이지에서는 4개만 필요
                        sortBy: 'createdAt',
                        direction: 'desc'
                    }
                })
                this.products = res.data.content
            } catch (err) {
                console.error('추천 상품 목록 불러오기 실패', err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        }
    }
}) 