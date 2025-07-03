import {defineStore} from 'pinia'
import api from '@/lib/axios.js'

export const useFishingDiaryStore = defineStore('fishingDiary', {
    state: () => ({
        diaries: [],
        totalPages: 1,
        totalElements: 0,
        page: 0,
        size: 12,
    }),
    actions: {
        async fetchDiaries(page = 0, size = 12) {
            try {
                const res = await api.get('/api/fishing-diary/get-all', {
                  params: { page, size }
                })
                this.diaries = res.data.content
                this.totalPages = res.data.totalPages
                this.totalElements = res.data.totalElements
                this.page = page
                this.size = size
                console.log('🟢 useFishingDiaryStore 조행기 목록:', this.diaries)
                if (this.diaries.length > 0) {
                    console.log('🟢 첫 번째 조행기:', this.diaries[0])
                    console.log('🟢 첫 번째 조행기 이미지:', this.diaries[0].images)
                }
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
        },

        // 조행기 생성 액션 (api.multipartPost 사용, 상품과 통일)
        async createFishingDiary(dto, files) {
            try {
                const res = await api.multipartPost({
                    url: '/api/fishing-diary/create',
                    dto: dto,
                    files: files,
                    dtoKey: 'dto',
                    fileKey: 'images'
                });
                console.log('🟢 조행기 생성 성공:', res.data)
                return res.data;
            } catch (err) {
                console.error('조행기 생성 실패', err);
                throw err;
            }
        },

        // 조행기 수정 액션 (api.multipartPut 사용, 상품과 통일)
        async updateFishingDiary(fdId, dto, files) {
            try {
                console.log('🟡 조행기 수정 - dto:', dto)
                console.log('🟡 조행기 수정 - files:', files)
                const res = await api.multipartPut({
                    url: `/api/fishing-diary/update/${fdId}`,
                    dto: dto,
                    files: files,
                    dtoKey: 'dto',
                    fileKey: 'images'
                });
                console.log('🟢 조행기 수정 성공:', res.data)
                return res.data;
            } catch (err) {
                console.error('조행기 수정 실패', err);
                throw err;
            }
        },

        // 조행기 삭제 액션
        async deleteFishingDiary(fdId) {
            try {
                console.log('🟡 조행기 삭제 - fdId:', fdId)
                const res = await api.delete(`/api/fishing-diary/delete/${fdId}`);
                console.log('🟢 조행기 삭제 성공:', res.data)
                return res.data;
            } catch (err) {
                console.error('조행기 삭제 실패', err);
                throw err;
            }
        }
    }
})