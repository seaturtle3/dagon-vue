import {defineStore} from 'pinia'
import api from '@/lib/axios.js'

export const useSeaProdStore = defineStore('seaProd', {
    state: () => ({
        products: [],
        page: 0,
        size: 10,
        totalPages: 0,
        loading: false,
    }),
    actions: {
        // 기본 상품 조회 메서드 (fallback용으로만 사용)
        async fetchProducts({
                                page = 0,
                                size = 1000,
                                sortBy = 'createdAt',
                                direction = 'desc'
                            } = {}) {
            if (this.loading) return // 중복 호출 방지
            this.loading = true
            try {
                const res = await api.get('/api/product/get-all/sea', {
                    params: {page, size, sortBy, direction}
                })
                this.products = res.data.content
                this.page = res.data.number
                this.size = res.data.size
                this.totalPages = res.data.totalPages
            } catch (error) {
                console.error('Sea products fetch error:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchFilteredProducts({
                                        region = '',
                                        subType = '',
                                        species = [],
                                        sortBy = 'createdAt',
                                        direction = 'desc',
                                        page = 0,
                                        size = 15
                                    } = {}) {
            if (this.loading) return // 중복 호출 방지
            this.loading = true
            try {
                // 기본 API 사용 (필터링은 나중에 구현)
                const res = await api.get('/api/product/get-all/sea', {
                    params: {page, size, sortBy, direction}
                })
                this.products = res.data.content
                this.page = res.data.number
                this.size = res.data.size
                this.totalPages = res.data.totalPages
            } catch (error) {
                console.error('Sea products fetch error:', error)
            } finally {
                this.loading = false
            }
        }
    }
})