// 조행기 스토어
import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductFishingDiaryStore = defineStore('productFishingDiary', {
    state: () => ({
        fishingDiaries: [],
        isLoading: false,
        error: null
    }),
    actions: {
        async fetchFishingDiaries(productId) {
            this.isLoading = true
            this.error = null
            try {
                const res = await axios.get(`/api/products/${productId}/diary`)
                this.fishingDiaries = res.data
            } catch (err) {
                this.error = err
                console.error('조행기 로딩 실패:', err)
            } finally {
                this.isLoading = false
            }
        }
    }
})
