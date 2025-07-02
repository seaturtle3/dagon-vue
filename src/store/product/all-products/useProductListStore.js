import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useProductListStore = defineStore('productList', {
    state: () => ({
        products: [],
        page: 0,
        size: 25,
        totalPages: 0,
    }),
    actions: {
        async fetchProducts() {
            try {
                const res = await api.get('/api/product/get-all', {
                    params: {
                        page: this.page,
                        size: this.size,
                        sortBy: 'createdAt',
                        direction: 'desc'
                    }
                })
                this.products = res.data.content
                this.totalPages = res.data.totalPages
            } catch (err) {
                console.error('상품 목록 불러오기 실패', err)
            }
        },
        goToPage(pageNum) {
            this.page = pageNum
            this.fetchProducts()
        }
    }
})