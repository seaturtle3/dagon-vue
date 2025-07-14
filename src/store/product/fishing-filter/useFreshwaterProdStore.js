import {defineStore} from 'pinia'
import api from '@/lib/axios.js'

export const useFreshwaterProdStore = defineStore('freshwaterProd', {
    state: () => ({
        products: [],
        page: 0,
        size: 10,
        totalPages: 0,
        loading: false,
    }),
    actions: {
        async fetchProducts({
                                page = 0,
                                size = 1000,
                                sortBy = 'createdAt',
                                direction = 'desc'
                            } = {}) {
            this.loading = true
            try {
                const res = await api.get('/api/product/get-all/freshwater', {
                    params: {page, size, sortBy, direction}
                })
                this.products = res.data.content
                this.page = res.data.number
                this.size = res.data.size
                this.totalPages = res.data.totalPages
            } catch (error) {
                console.error('Freshwater products fetch error:', error)
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
            this.loading = true
            try {
                // 기본 API 사용 (필터링은 나중에 구현)
                const res = await api.get('/api/product/get-all/freshwater', {
                    params: {page, size, sortBy, direction}
                })
                this.products = res.data.content
                this.page = res.data.number
                this.size = res.data.size
                this.totalPages = res.data.totalPages
            } catch (error) {
                console.error('Freshwater products fetch error:', error)
            } finally {
                this.loading = false
            }
        }
    }
})