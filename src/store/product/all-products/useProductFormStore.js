import { defineStore } from 'pinia'
import { createProduct } from '@/api/product.js'
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
        },

        setForm(product) {
            this.form = {
                prodName: product.prodName || '',
                prodRegion: product.prodRegion || '',
                mainType: product.mainType || '',
                subType: product.subType || '',
                maxPerson: product.maxPerson || null,
                minPerson: product.minPerson || null,
                weight: product.weight || null,
                prodAddress: product.prodAddress || '',
                prodDescription: product.prodDescription || '',
                prodEvent: product.prodEvent || '',
                prodNotice: product.prodNotice || ''
            }
        }
    }
})