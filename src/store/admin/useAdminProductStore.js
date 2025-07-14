import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useAdminProductStore = defineStore('adminProduct', {
  state: () => ({
    products: [],
    stats: {},
    loading: false,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
    filters: {
      search: '',
      mainType: '',
      region: '',
      deleted: ''
    }
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          sortBy: 'prodId',
          direction: 'desc'
        }
        
        if (this.filters.search) params.search = this.filters.search
        if (this.filters.mainType) params.mainType = this.filters.mainType
        if (this.filters.region) params.region = this.filters.region
        if (this.filters.deleted !== '') params.deleted = this.filters.deleted === 'true'
        
        const response = await api.get('/api/admin/products', { params })
        this.products = response.data.content
        this.totalPages = response.data.totalPages
        this.totalElements = response.data.totalElements
      } catch (error) {
        console.error('제품 목록 로드 실패:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const response = await api.get('/api/admin/products/stats')
        this.stats = response.data
      } catch (error) {
        console.error('통계 로드 실패:', error)
        throw error
      }
    },

    async createProduct(productData) {
      try {
        // productData가 FormData가 아니면 분리해서 multipartPost 사용
        if (productData instanceof FormData) {
          return (await api.post('/api/admin/products/create', productData)).data
        } else {
          // productData: { dto, files }
          return (await api.multipartPost({
            url: '/api/admin/products/create',
            dto: productData.dto || productData,
            files: productData.files || [],
            dtoKey: 'dto',
            fileKey: 'Images'
          })).data
        }
      } catch (error) {
        console.error('제품 등록 실패:', error)
        throw error
      }
    },

    async updateProduct(productId, productData) {
      try {
        // productData가 FormData가 아니면 분리해서 multipartPut 사용
        if (productData instanceof FormData) {
          return (await api.put(`/api/admin/products/${productId}`, productData)).data
        } else {
          // productData: { dto, files }
          return (await api.multipartPut({
            url: `/api/admin/products/${productId}`,
            dto: productData.dto || productData,
            files: productData.files || [],
            dtoKey: 'dto',
            fileKey: 'Images'
          })).data
        }
      } catch (error) {
        console.error('제품 수정 실패:', error)
        throw error
      }
    },

    async deleteProduct(productId) {
      try {
        const response = await api.delete(`/api/admin/products/${productId}`)
        return response.data
      } catch (error) {
        console.error('제품 삭제 실패:', error)
        throw error
      }
    },

    async restoreProduct(productId) {
      try {
        const response = await api.put(`/api/admin/products/${productId}/restore`)
        return response.data
      } catch (error) {
        console.error('제품 복구 실패:', error)
        throw error
      }
    },

    async getProduct(productId) {
      try {
        const response = await api.get(`/api/admin/products/${productId}`)
        return response.data
      } catch (error) {
        console.error('제품 조회 실패:', error)
        throw error
      }
    },



    setPage(page) {
      this.currentPage = page
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.currentPage = 0
    },

    resetFilters() {
      this.filters = {
        search: '',
        mainType: '',
        region: '',
        deleted: ''
      }
      this.currentPage = 0
    }
  },

  getters: {
    hasProducts: (state) => state.products.length > 0,
    isFirstPage: (state) => state.currentPage === 0,
    isLastPage: (state) => state.currentPage >= state.totalPages - 1,
    startIndex: (state) => (state.currentPage * state.pageSize) + 1,
    endIndex: (state) => Math.min((state.currentPage + 1) * state.pageSize, state.totalElements)
  }
}) 