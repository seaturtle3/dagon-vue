import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useProductFishingReportStore = defineStore('productFishingReport', {
    state: () => ({
        report: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchFishingReport(productId) {
            this.loading = true
            this.error = null
            try {
                const response = await api.get(`/product/fishing-report/${productId}`)
                this.report = response.data
            } catch (err) {
                this.error = err.response?.data?.message || '조황정보 조회 실패'
            } finally {
                this.loading = false
            }
        }
    }
})
