import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useProductFishingCenterStore = defineStore('productFishingCenter', {
    state: () => ({
        report: [],
        diary: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchFishingCenter(productId) {
            this.loading = true
            this.error = null
            try {
                const response = await api.get(`api/product/fishing-center/${productId}`)
                this.report = response.data.reportList
                this.diary = response.data.diaryList

                console.log(response.data)

            } catch (err) {
                // 404 에러는 데이터가 없다는 의미이므로 정상 처리
                if (err.response?.status === 404) {
                    this.report = []
                    this.diary = []
                } else {
                    this.error = err.response?.data?.message || '조회 실패'
                }
            } finally {
                this.loading = false
            }
        }
    }
})
