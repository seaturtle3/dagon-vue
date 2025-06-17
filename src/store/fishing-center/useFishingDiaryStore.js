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

        // 단건 조황 가져오기
        async fetchDiaryById(id) {
            try {
                const res = await api.get(`/api/fishing-diary/get/${id}`)
                this.currentDiary = res.data
                console.log('단일 조행기:', this.currentDiary)
            } catch (e) {
                console.error(`조행기(id: ${id}) 로드 실패`, e)
            }
        }
    }
})