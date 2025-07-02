import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useProductFishingDiaryStore = defineStore('productFishingDiary', {
    state: () => ({
        diary: [],
        loading: false,
        error: null,
        lastFetchedProductId: null, // ✅ 마지막으로 요청한 productId 저장
    }),

    actions: {
        async fetchFishingDiary(productId) {
            if (this.lastFetchedProductId === productId && this.diary.length > 0) {
                // ✅ 이미 불러온 productId이면 다시 요청하지 않음 (선택사항)
                return
            }

            this.loading = true
            this.error = null
            this.diary = [] // ✅ 새 요청 전에 데이터 초기화
            this.lastFetchedProductId = productId

            try {
                const response = await api.get(`api/product/fishing-diary/${productId}`)
                this.diary = response.data
            } catch (err) {
                // 404 에러는 데이터가 없다는 의미이므로 정상 처리
                if (err.response?.status === 404) {
                    this.diary = []
                } else {
                    this.error = err.response?.data?.message || '조행기 조회 실패'
                }
            } finally {
                this.loading = false
            }
        },

        clearDiary() {
            // ✅ 명시적으로 clear하는 메서드도 추가
            this.diary = []
            this.lastFetchedProductId = null
        }
    },

    getters: {
        getDiaryByProductId: (state) => {
            return (productId) => {
                return state.diary || []
            }
        }
    }
})
