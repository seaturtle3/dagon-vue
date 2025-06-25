import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useProductFishingReportStore = defineStore('productFishingReport', {
    state: () => ({
        reportMap: new Map(), // key: productId, value: reportList
        loading: false,
        error: null,
    }),

    actions: {
        async fetchFishingReport(productId) {
            this.loading = true
            this.error = null
            try {
                const response = await api.get(`/product/fishing-report/${productId}`)
                this.reportMap.set(productId, response.data)
            } catch (err) {
                this.error = err.response?.data?.message || '조황정보 조회 실패'
            } finally {
                this.loading = false
            }
        }
    },

    getters: {
        getReportByProductId: (state) => {
            return (productId) => {
                return state.reportMap.get(productId) || []
            }
        }
    }
})
