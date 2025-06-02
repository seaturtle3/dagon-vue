// store/product/productStore.js
import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        page: 0,
        size: 10,
        totalPages: 0,
        form: {
            prodName: '',
            prodRegion: '',
            mainType: '',
            subType: '',
            maxPerson: null,
            minPerson: null,
            weight: null,
            prodAddress: '',
            prodDescription: '',
            prodEvent: '',
            prodNotice: ''
        },
        enums: {
            regions: [],
            mainTypes: [],
            subTypes: []
        },
        // list, form 교체
        showForm: false,
    }),

    actions: {
        async fetchProducts() {
            try {
                const res = await api.get('/api/product/get-all', {
                    params: { page: this.page, size: this.size }
                })
                this.products = res.data.content
                this.totalPages = res.data.totalPages

            } catch (err) {
                console.error('상품 목록 불러오기 실패', err)
            }
        },

        async loadEnums() {
            // 백엔드에서 불러오거나 하드코딩
            this.enums.regions = [
                { name: 'SEOUL', korean: '서울' },
                { name: 'BUSAN', korean: '부산' }
            ]
            this.enums.mainTypes = [
                { name: 'SEA', korean: '바다' },
                { name: 'FRESHWATER', korean: '민물' }
            ]
            this.enums.subTypes = [
                { name: 'TYPE1', korean: '유형1' },
                { name: 'TYPE2', korean: '유형2' }
            ]
        },

        async submitForm() {
            try {
                const res = await api.post('/api/product/create', this.form)
                alert('등록 성공: ID ' + res.data)
                this.resetForm()
                await this.fetchProducts() // 등록 후 리스트 새로고침
            } catch (err) {
                console.error('등록 실패', err)
                alert('등록 실패')
            }
        },

        resetForm() {
            this.form = {
                prodName: '',
                prodRegion: '',
                mainType: '',
                subType: '',
                maxPerson: null,
                minPerson: null,
                weight: null,
                prodAddress: '',
                prodDescription: '',
                prodEvent: '',
                prodNotice: ''
            }
        },

        goToPage(pageNum) {
            this.page = pageNum
            this.fetchProducts()
        },

        // list, form 토글
        toggleForm() {
            this.showForm = !this.showForm
        }
    }
})
