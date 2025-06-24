import { defineStore } from 'pinia'
import api from '@/lib/axios.js'


export const useFishingReportStore = defineStore('fishingReport', {
    state: () => ({
        reports: [],
        currentReport: null, // 상세보기용
        currentPage: 0,
        pageSize: 10,
        totalPages: 1,
        loading: false,
    }),
    actions: {
        async fetchReports(page = 0, size = 10) {
            if (this.loading) return
            this.loading = true
            try {
                const res = await api.get('/api/fishing-report/get-all', {
                    params: {
                        page,
                        size,
                        sortBy: 'frId',
                        direction: 'desc'
                    }
                })
                const data = res.data
                if (page === 0) {
                    this.reports = data.content
                } else {
                    this.reports = [...this.reports, ...data.content]
                }
                this.currentPage = data.number
                this.totalPages = data.totalPages
            } catch (err) {
                console.error('조황정보 로드 실패', err)
            } finally {
                this.loading = false
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
        },

        // 조황정보 생성 액션
        async createFishingReport(formData) {
            try {
                const res = await api.post('/api/fishing-report/create', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                })
                return res.data
            } catch (err) {
                console.error('조황정보 생성 실패', err)
                throw err
            }
        }
    }
})
