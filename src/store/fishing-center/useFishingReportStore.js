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
                        sortBy: 'createdAt',
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


        // 조황정보 삭제 액션
        async deleteFishingReport(id) {
            try {
                await api.delete(`/api/fishing-report/delete/${id}`)
            } catch (err) {
                console.error('조황정보 삭제 실패', err)
                throw err
            }
        },

        // 조황정보 생성 액션 (multipart)
        async createFishingReport(dto, file) {
            try {
                const res = await api.multipartPost({
                    url: '/api/fishing-report/create',
                    dto,
                    files: file
                });
                return res.data;
            } catch (err) {
                console.error('조황정보 생성 실패', err)
                throw err;
            }
        },

        // 조황정보 수정 액션 (application/json)
        async updateFishingReport(id, reportDto, file) {
            try {
                const res = await api.multipartPut({
                    url: `/api/fishing-report/update/${id}`,
                    dto: reportDto,
                    files: file
                });
                return res.data;
            } catch (err) {
                console.error('조황정보 수정 실패', err);
                throw err;
            }
        },
    }
})
