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
        async createFishingReport(dto, images = []) {
            try {
                const formData = new FormData()

                // dto는 JSON 문자열로 변환해서 append
                formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))

                // images가 있으면 다 append
                images.forEach((file, index) => {
                    formData.append('images', file)
                })

                // 토큰 자동으로 붙는 axios 설정이면 헤더 안 써도 되지만,
                // 혹시 필요하면 아래처럼 헤더 추가 가능
                const res = await api.post('/api/fishing-report/create', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        // 'Authorization': 'Bearer ' + 토큰, // 보통 axios 인터셉터에서 처리함
                    }
                })

                // 생성된 조황정보 반환
                return res.data
            } catch (err) {
                console.error('조황정보 생성 실패', err)
                throw err
            }
        }
    }
})
