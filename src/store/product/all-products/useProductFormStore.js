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
        images: [], // ✅ 이미지 첨부용
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
                    new Blob([JSON.stringify(dtoToSend)], { type: 'application/json' })
                );

                // 👇 썸네일 이미지들 추가
                this.images.forEach((file) => {
                    formData.append('images', file)
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
                console.log('🟡 dtoToSend:', dtoToSend);
                console.log('🟡 files:', files);

                const res = await api.multipartPut({
                    url: `/api/product/update/${prodId}`,
                    dto: dtoToSend,
                    files: files,
                    dtoKey: 'product',
                    fileKey: 'images'
                });
                alert('제품 수정 성공');
                this.resetForm();
                return prodId;
            } catch (err) {
                console.error('제품 수정 실패', err);
                alert('제품 수정 실패');
                throw err;
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
            this.images = []
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
            this.images = [] // 초기화 or 필요한 경우 기존 파일 유지 로직 추가 가능
        }
    }
})