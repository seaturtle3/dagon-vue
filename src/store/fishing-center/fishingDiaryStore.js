import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useFishingDiaryStore = defineStore('fishingDiary', {
    state: () => ({
        diaries: [],
    }),
    actions: {
        async fetchDiaries() {
            try {
                const res = await api.get('/api/fishing-diary/get-all')
                this.diaries = res.data
                console.log('조행기 로드 완료:', this.diaries)
            } catch (err) {
                console.error('조행기 불러오기 실패', err)
            }
        },
    },
})