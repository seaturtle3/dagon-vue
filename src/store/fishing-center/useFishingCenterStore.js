import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useFishingCenterStore = defineStore('fishingCenter', {
    state: () => ({
        reportList: [],
        diaryList: [],
        loading: false,
        error: null,
        serverStatus: 'unknown' // 'unknown', 'connected', 'disconnected'
    }),

    actions: {
        // 서버 연결 상태 확인
        async checkServerStatus() {
            try {
                // 실제 존재하는 API 엔드포인트로 서버 상태 확인
                const response = await api.get('/api/fishing-report/get-all', { timeout: 5000 })
                this.serverStatus = 'connected'
                return true
            } catch (error) {
                // 404 에러는 서버가 실행 중이지만 엔드포인트가 없는 경우
                if (error.response && error.response.status === 404) {
                    console.warn('서버는 실행 중이지만 해당 엔드포인트가 존재하지 않습니다.')
                    this.serverStatus = 'connected'
                    return true
                }
                
                this.serverStatus = 'disconnected'
                console.error('서버 연결 상태 확인 실패:', error.message)
                return false
            }
        },

        async fetchFishingCenterData() {
            this.loading = true
            this.error = null
            
            try {
                console.log('조황센터 데이터 요청 시작...')
                
                // 조황정보와 조행기를 개별적으로 가져오기 (홈페이지용으로 10개만)
                const [reportResponse, diaryResponse] = await Promise.all([
                    api.get('/api/fishing-report/get-all', {
                        params: {
                            page: 0,
                            size: 10,
                            sortBy: 'frId',
                            direction: 'desc'
                        }
                    }),
                    api.get('/api/fishing-diary/get-all', {
                        params: {
                            page: 0,
                            size: 10,
                            sortBy: 'fdId',
                            direction: 'desc'
                        }
                    })
                ])
                
                console.log('조황정보 응답:', reportResponse.data)
                console.log('조행기 응답:', diaryResponse.data)

                this.reportList = reportResponse.data.content || []
                this.diaryList = diaryResponse.data.content || []
                this.loading = false
                this.serverStatus = 'connected'
            } catch (err) {
                console.error('조황센터 데이터 로드 실패', err)
                this.error = err.message || '데이터 로드에 실패했습니다.'
                this.loading = false
                
                // 사용자에게 에러 메시지 표시
                if (err.code === 'ECONNABORTED') {
                    alert('서버 연결 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.')
                } else if (!err.response) {
                    alert('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
                } else if (err.response.status === 404) {
                    alert('요청한 API 엔드포인트를 찾을 수 없습니다. 백엔드 개발자에게 문의해주세요.')
                } else {
                    alert('데이터를 불러오는 중 오류가 발생했습니다.')
                }
            }
        }
    }
})

