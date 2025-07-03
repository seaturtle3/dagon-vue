import { defineStore } from 'pinia'
import { createProduct, updateProduct } from '@/api/product.js'
import api from '@/lib/axios.js'


export const useProductFormStore = defineStore('productForm', {
    state: () => ({
        form: {
            prodId: null,
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
            prodNotice: '',
            prodImageNames: []  // 추가
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
        async createProductAction(dtoToSend, files) {
            try {
                const res = await createProduct(dtoToSend, files)
                alert('등록 성공')
                this.resetForm()
                // 임시: 상품 전체 리스트를 불러와 가장 최신(prodId가 가장 큰) 상품의 prodId 반환
                const listRes = await api.get('/api/product/get-all', { params: { page: 0, size: 1, sort: 'prodId,DESC' } })
                const prodId = listRes.data?.content?.[0]?.prodId || null
                return { data: { prodId } }
            } catch (err) {
                console.error('등록 실패', err)
                alert('등록 실패')
                throw err
            }
        },
        // 상품 수정 액션
        async updateProductAction(prodId, dtoToSend, files) {
            try {
                const res = await updateProduct(prodId, dtoToSend, files)
                alert('수정 성공')
                this.resetForm()
                return prodId // prodId 반환
            } catch (err) {
                console.error('수정 실패', err)
                alert('수정 실패')
                throw err
            }
        },
        resetForm() {
            this.form = {
                prodId: null,  // 추가
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
                prodNotice: '',
                prodImageNames: [],
            }
            this.thumbnailFiles = []
        },
        toggleForm() {
            this.showForm = !this.showForm
        },

        setForm(product) {
            this.form = {
                prodId: product.prodId || null,
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
                prodNotice: product.prodNotice || '',
                prodImageNames: product.prodImageNames || []  // 추가
            }
            this.thumbnailFiles = [] // 초기화 or 필요한 경우 기존 파일 유지 로직 추가 가능
        }
    }
})