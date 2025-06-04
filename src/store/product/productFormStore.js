import { defineStore } from 'pinia'
import api from '@/lib/axios'

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
        showForm: false
    }),
    actions: {
        async submitForm() {
            try {
                const res = await api.post('/api/product/create', this.form)
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
        },
        toggleForm() {
            this.showForm = !this.showForm
        }
    }
})