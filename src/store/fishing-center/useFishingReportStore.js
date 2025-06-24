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
        },

        // 조황정보 수정 액션 (application/json)
        async updateFishingReport(id, reportDto) {
            try {
                const res = await api.put(`/api/fishing-report/update/${id}`, reportDto, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                return res.data
            } catch (err) {
                console.error('조황정보 수정 실패', err)
                throw err
            }
        },

        // 조황정보 삭제 액션
        async deleteFishingReport(id) {
            try {
                await api.delete(`/api/fishing-report/delete/${id}`)
            } catch (err) {
                console.error('조황정보 삭제 실패', err)
                throw err
            }
        }
    }
})
