import { defineStore } from 'pinia'
import api from '@/lib/axios.js'


export const useFishingReportStore = defineStore('fishingReport', {
    state: () => ({
        reports: [],
        currentReport: null, // 상세보기용
        currentPage: 0,
        pageSize: 12,
        totalPages: 1,
        loading: false,
    }),
    actions: {
        async fetchReports(page = 0, size = 12) {
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
                this.reports = data.content // 항상 새로 덮어쓰기
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
                console.log('단일 조황 images:', this.currentReport.images)
                console.log('단일 조황 thumbnailUrl:', this.currentReport.thumbnailUrl)
                console.log('단일 조황 imageFileName:', this.currentReport.imageFileName)
            } catch (e) {
                console.error(`조황정보(id: ${id}) 로드 실패`, e)
            }
        },


        // 조황정보 삭제 액션
        async deleteFishingReport(id) {
            try {
                console.log('조황정보 삭제 시도 - ID:', id);
                const response = await api.delete(`/api/fishing-report/delete/${id}`);
                console.log('조황정보 삭제 성공:', response);
                
                // 삭제 성공 시 스토어에서 해당 조황정보 제거
                this.reports = this.reports.filter(report => report.frId !== id);
                
                // 현재 보고 있는 조황정보가 삭제된 것이라면 null로 설정
                if (this.currentReport && this.currentReport.frId === id) {
                    this.currentReport = null;
                }
                
                return response;
            } catch (err) {
                console.error('조황정보 삭제 실패 - ID:', id);
                console.error('에러 상세:', err);
                console.error('에러 응답:', err.response);
                console.error('에러 메시지:', err.message);
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
                
                // 생성 성공 시 새로 생성된 조황정보를 리스트 맨 앞에 추가
                if (res.data) {
                    this.reports.unshift(res.data);
                }
                
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
                console.log('수정 API 응답:', res.data);
                return res.data;
            } catch (err) {
                console.error('조황정보 수정 실패', err);
                throw err;
            }
        },
    }
})
