import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useFreshwaterFishingStore = defineStore('freshwaterFishing', {
    state: () => ({
        products: [],
        page: 0,
        size: 10,
        totalPages: 0,
        loading: false,
    }),
    actions: {
        async fetchProducts({ page = 0, size = 10, sortBy = 'prodId', direction = 'desc' } = {}) {
            this.loading = true
            try {
                const res = await api.get('/get-all/freshwater', {
                    params: { page, size, sortBy, direction }
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