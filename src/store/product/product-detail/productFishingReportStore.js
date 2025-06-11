import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductFishingReportStore = defineStore('productFishingReport', {
    state: () => ({
        fishingReports: [],
        isLoading: false,
        error: null
    }),
    actions: {
        async fetchFishingReports(productId) {
            this.isLoading = true
            this.error = null
            try {
                const res = await axios.get(`/api/products/${productId}/reports`)
                this.fishingReports = res.data
            } catch (err) {
                this.error = err
                console.error('조황정보 로딩 실패:', err)
            } finally {
                this.isLoading = false
            }
        }
    }
})
