import api from '@/lib/axios'

// 사용자용 이벤트 목록 조회
export const fetchEvents = (params) => {
    return api.get('/api/event', { params })
}

// 사용자용 이벤트 상세 조회
export const fetchEventById = (id) => {
    return api.get(`/api/event/${id}`)
}

// 관리자용 이벤트 목록 조회
export const getAdminEvents = (params) => {
    return api.get('/api/admin/event', { params })
}

// 관리자용 이벤트 생성 (이미지 포함)
export const createEvent = (eventData, files = []) => {
    if (files && files.length > 0) {
        return api.multipartPost({
            url: '/api/admin/event',
            dto: eventData,
            files: files,
            dtoKey: 'dto',
            fileKey: 'images'
        })
    } else {
        return api.post('/api/admin/event', eventData)
    }
}

// 관리자용 이벤트 수정 (이미지 포함)
export const updateEvent = (id, eventData, files = []) => {
    if (files && files.length > 0) {
        return api.multipartPut({
            url: `/api/admin/event/${id}`,
            dto: eventData,
            files: files,
            dtoKey: 'dto',
            fileKey: 'images'
        })
    } else {
        return api.post(`/api/admin/event/${id}`, eventData)
    }
}

// 관리자용 이벤트 삭제
export const deleteEvent = (id) => {
    return api.delete(`/api/admin/event/${id}`)
}

// 관리자용 이벤트 상세 조회
export const getEventById = (id) => {
    return api.get(`/api/admin/event/${id}`)
}