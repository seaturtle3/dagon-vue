import { defineStore } from 'pinia'
import axios from '@/lib/axios.js'

export const useFishingCenterStore = defineStore('fishingCenter', {
    state: () => ({
        reportList: [],
        diaryList: [],
    }),

    actions: {
        async fetchFishingCenterData() {
            try {
                const res = await axios.get('/api/fishing-center/get-all') // ← 이 API에서 reportList + diaryList 줌
                console.log('useFishingCenterStore 조황센터 응답:', res.data)

                this.reportList = res.data.reportList
                this.diaryList = res.data.diaryList
            } catch (err) {
                console.error('조황센터 데이터 로드 실패', err)
            }
        }
    }
})

