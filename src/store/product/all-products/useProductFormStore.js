import {defineStore} from 'pinia'
import {createProduct, updateProduct} from '@/api/product.js'
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
        },
        thumbnailFile: null, // ✅ 단일 파일
        showForm: false
    }),
    actions: {
        async submitForm() {
            try {
                const pureDeletedNames = [...deletedImageNames];

                const dtoToSend = {
                    ...localForm,
                    deleteImageNames: pureDeletedNames,
                };
                const formData = new FormData()
                formData.append(
                    'product',
                    new Blob([JSON.stringify(dtoToSend)], {type: 'application/json'})
                );

                // 👇 썸네일 이미지들 추가
                this.thumbnailFiles.forEach((file) => {
                    formData.append('thumbnailFiles', file)
                })

                // 👇 앞에서 만든 createProduct 함수 호출
                const res = await createProduct(formData)
                alert('등록 성공: ID ' + res.data)
                this.resetForm()

                for (const [key, val] of formData.entries()) {
                    if (val instanceof Blob) {
                        // Blob이면 내용 읽어오기
                        val.text().then(text => {
                            console.log('🟡 key:', key);
                            console.log('🟢 Blob 내용:', text);
                        });
                    } else {
                        console.log('🔵 key:', key);
                        console.log('🔴 value:', val);
                    }
                }

            } catch (err) {
                console.error('등록 실패', err)
                alert('등록 실패')
            }
        },
        // 상품 등록 액션
        async createProductAction(dtoToSend, file, router) {
            try {
                await createProduct(dtoToSend, file)
                alert('등록 성공')
                if (router) router.push('/products')
                this.resetForm()
            } catch (err) {
                console.error('등록 실패', err)
                alert('등록 실패')
            }
        },
        // 상품 수정 액션
        async updateProductAction(prodId, dtoToSend, file, router) {
            try {
                await updateProduct(prodId, dtoToSend, file)
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
            }
            this.thumbnailFile = null
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
            }
            this.thumbnailFile = null
        }
    }
})