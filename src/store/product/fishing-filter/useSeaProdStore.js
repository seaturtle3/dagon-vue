import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useSeaProdStore = defineStore('seaProdStore', {
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
        },

        async fetchFilteredProducts({ region = '', subType = '', species = '' } = {}) {
            this.loading = true
            try {
                const res = await api.get('/api/product/get-all/sea/detail', {
                    params: { region, subType, species }
                })
                this.products = res.data // 이건 List<ProductDTO> 반환이라고 가정
            } catch (error) {
                console.error('Filtered sea products fetch error:', error)
            } finally {
                this.loading = false
            }
        }
    }
})