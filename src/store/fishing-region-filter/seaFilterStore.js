import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useSeaFishingStore = defineStore('seaFilterStore', {
    state: () => ({
        products: [],
        page: 0,
        size: 10,
        totalPages: 0,
        loading: false,
    }),
    actions: {
        async fetchProducts({ page = 0, size = 1000, sortBy = 'prodId', direction = 'desc'} = {}) {
            this.loading = true
            try {
                const res = await api.get('/api/product/get-all/sea', {
                    params: { page, size, sortBy, direction }
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