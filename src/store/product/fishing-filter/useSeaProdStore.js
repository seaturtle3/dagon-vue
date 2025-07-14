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
                const params = new URLSearchParams()
                if (region) params.append('region', region)
                if (subType) params.append('subType', subType)
                if (species && Array.isArray(species)) {
                    species.forEach(s => params.append('species', s))
                }
                params.append('sortBy', sortBy)
                params.append('direction', direction)
                params.append('page', page)
                params.append('size', size)

                const res = await api.get('/api/product/get-all/sea/filter?' + params.toString())
                // Page 객체 형태로 내려올 경우 처리
                if (res.data && res.data.content) {
                  this.products = res.data.content
                  this.page = res.data.number
                  this.size = res.data.size
                  this.totalPages = res.data.totalPages
                } else {
                  this.products = res.data
                }
            } catch (error) {
                console.error('Filtered sea products fetch error:', error)
                // 에러 발생 시 기본 API로 fallback
                console.log('Falling back to basic products API...')
                try {
                    await this.fetchProducts({ page, size, sortBy, direction })
                } catch (fallbackError) {
                    console.error('Fallback API also failed:', fallbackError)
                    // 최소한 빈 배열이라도 설정
                    this.products = []
                }
            } finally {
                this.loading = false
            }
        }
    }
})