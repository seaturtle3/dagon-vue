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
                                        direction = 'desc'
                                    } = {}) {
            this.loading = true
            try {
                const params = new URLSearchParams()
                if (region) params.append('region', region)
                if (subType) params.append('subType', subType)
                if (species && Array.isArray(species)) {
                    species.forEach(s => params.append('species', s))
                }
                params.append('sortBy', sortBy)
                params.append('direction', direction)

                const res = await api.get('/api/product/get-all/freshwater/filter?' + params.toString())
                this.products = res.data
            } catch (error) {
                console.error('Filtered freshwater products fetch error:', error)
            } finally {
                this.loading = false
            }
        }
    }
})