import { defineStore } from 'pinia'
import axios from '@/lib/axios.js'

export const useFishingCenterStore = defineStore('fishingCenter', {
    state: () => ({
        products: [],
        page: 0,
        size: 10,
        totalPages: 0
    }),

    actions: {
        async fetchProducts() {
            try {
                const res = await axios.get('/api/fishing-center/get-with-reports-or-diaries', {
                    params: { page: this.page, size: this.size }
                })
                this.products = res.data.content
                this.totalPages = res.data.totalPages
            } catch (err) {
                console.error('상품 불러오기 실패', err)
            }
        },
        goToPage(pageNum) {
            this.page = pageNum
            this.fetchProducts()
        }
    }
})
