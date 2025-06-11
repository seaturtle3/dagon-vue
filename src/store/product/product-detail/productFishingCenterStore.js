// 조황센터 스토어 (조황정보 + 조행기 동시 호출)
import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductFishingCenterStore = defineStore('productFishingCenter', {
    state: () => ({
        reports: [],
        diaries: [],
        isLoading: false,
        error: null
    }),
    actions: {
        async fetchFishingCenterData(productId) {
            this.isLoading = true
            this.error = null
            try {
                const [reportRes, diaryRes] = await Promise.all([
                    axios.get(`/api/products/${productId}/fishing-reports`),
                    axios.get(`/api/products/${productId}/fishing-diary`)
                ])
                this.reports = reportRes.data
                this.diaries = diaryRes.data
            } catch (err) {
                this.error = err
                console.error('조황센터 로딩 실패:', err)
            } finally {
                this.isLoading = false
            }
        }
    }
})
