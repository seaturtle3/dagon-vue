import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useFishingReportStore = defineStore('fishingReport', {
    state: () => ({
        reports: [],
        currentReport: null, // 상세보기용
    }),
    actions: {
        async fetchReports() {
            try {
                const res = await api.get('/api/fishing-report/get-all')
                this.reports = res.data.content
                console.log('useFishingReportStore 조황정보 :', this.reports)
            } catch (err) {
                console.error('조황정보 로드 실패', err)
            }
        },

        // 단건 조황 가져오기
        async fetchReportById(id) {
            try {
                const res = await api.get(`/api/fishing-report/get/${id}`)
                this.currentReport = res.data
                console.log('단일 조황:', this.currentReport)
            } catch (e) {
                console.error(`조황정보(id: ${id}) 로드 실패`, e)
            }
        }
    }
})
