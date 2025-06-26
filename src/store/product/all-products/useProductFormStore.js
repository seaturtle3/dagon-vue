import { defineStore } from 'pinia'
import { createProduct, updateProduct } from '@/api/product.js'
import api from '@/lib/axios.js'


export const useProductFormStore = defineStore('productForm', {
    state: () => ({
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
        thumbnailFiles: [], // ✅ 이미지 첨부용
        showForm: false
    }),
    actions: {
        async submitForm() {
            try {
                const formData = new FormData()

                // 👇 JSON payload를 Blob으로 감싸기 (백엔드에서 @RequestPart("product")로 받기 위함)
                formData.append(
                    'product',
                    new Blob([JSON.stringify(this.form)], { type: 'application/json' })
                )

                // 👇 썸네일 이미지들 추가
                this.thumbnailFiles.forEach((file) => {
                    formData.append('thumbnailFiles', file)
                })

                // 👇 앞에서 만든 createProduct 함수 호출
                const res = await createProduct(formData)
                alert('등록 성공: ID ' + res.data)
                this.resetForm()
            } catch (err) {
                console.error('등록 실패', err)
                alert('등록 실패')
            }
        },
        // ProductFormView.vue submit 로직을 store 액션으로 구현
        async createProductAction(dtoToSend, files, router) {
            try {
                const res = await createProduct(dtoToSend, files)
                alert('등록 성공')
                if (router) router.push('/products')
                this.resetForm()
            } catch (err) {
                console.error('등록 실패', err)
                alert('등록 실패')
            }
        },
        // 상품 수정 액션
        async updateProductAction(prodId, dtoToSend, files, router) {
            try {
                const res = await updateProduct(prodId, dtoToSend, files)
                alert('수정 성공')
                if (router) router.push('/products')
                this.resetForm()
            } catch (err) {
                console.error('수정 실패', err)
                alert('수정 실패')
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
            this.thumbnailFiles = []
        },
        toggleForm() {
            this.showForm = !this.showForm
        }
    }
})