import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useProductEnumStore = defineStore('productEnum', {
    state: () => ({
        regions: [],
        mainTypes: [],
        subTypes: []
    }),
    actions: {
        async loadEnums() {
            try {
                const [r1, r2, r3] = await Promise.all([
                    api.get('/api/enums/prod-regions'),
                    api.get('/api/enums/main-types'),
                    api.get('/api/enums/sub-types')
                ])
                this.regions = r1.data
                this.mainTypes = r2.data
                this.subTypes = r3.data

            } catch (err) {
                console.error('enum 불러오기 실패', err)
            }
        }
    }
})
