import { defineStore } from 'pinia'
import api from '@/lib/axios'

export const useFishingReportStore = defineStore('fishingReport', {
    state: () => ({
        reports: [],
    }),
    actions: {
        async fetchReports() {
            try {
                const res = await api.get('/api/fishing-report/get-all')
                this.reports = res.data
                console.log('조황정보 로드 완료:', this.reports)
            } catch (err) {
                console.error('조황정보 로드 실패', err)
            }
        },
    },
})
