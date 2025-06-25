import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useProductFishingDiaryStore = defineStore('productFishingDiary', {
    state: () => ({
        diary: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchFishingDiary(productId) {
            this.loading = true
            this.error = null
            try {
                const response = await api.get(`/product/fishing-diary/${productId}`)
                this.diary = response.data
            } catch (err) {
                this.error = err.response?.data?.message || '조행기 조회 실패'
            } finally {
                this.loading = false
            }
        }
    }
})
