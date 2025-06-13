import { defineStore } from 'pinia'
import axios from '@/lib/axios.js'

export const useFishingCenterStore = defineStore('fishingCenter', {
    state: () => ({
        fishingCenters: [],
        page: 0,
        size: 10,
        totalPages: 0
    }),

    actions: {
        async fetchFishingCenters() {
            try {
                const res = await axios.get('/api/fishing-center/get-all', {
                    params: { page: this.page, size: this.size }
                })
                console.log(res.data)

                this.fishingCenters = res.data.content
                this.totalPages = res.data.totalPages
            } catch (err) {
                console.error('조황센터 불러오기 실패', err)
            }
        },

        goToPage(pageNum) {
            this.page = pageNum
            this.fetchFishingCenters()
        }
    }
})

