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
                this.diaries = res.data.content
                console.log('useFishingDiaryStore 조행기 :', this.diaries)
            } catch (err) {
                console.error('조행기 불러오기 실패', err)
            }
        },
    },
})