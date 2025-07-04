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
        // 썸네일 플래그가 있는 파일들 처리
        const thumbnailFiles = files.filter(item => item.isThumbnail).map(item => item.file)
        const normalFiles = files.filter(item => !item.isThumbnail).map(item => item.file)
        
        // 썸네일 이미지들만 전송
        if (thumbnailFiles.length > 0) {
            return api.multipartPost({
                url: '/api/admin/event',
                dto: eventData,
                files: thumbnailFiles,
                dtoKey: 'dto',
                fileKey: 'images'
            })
        } else {
            return api.post('/api/admin/event', eventData)
        }
    } else {
        return api.post('/api/admin/event', eventData)
    }
}

// 관리자용 이벤트 수정 (이미지 포함)
export const updateEvent = (id, eventData, files = []) => {
    // 이미지 변경사항이 있는 경우
    if (eventData.editorImageChanges && 
        (eventData.editorImageChanges.deletedImages.length > 0 || 
         eventData.editorImageChanges.newImages.length > 0)) {
        
        console.log('이미지 변경사항이 있습니다:', eventData.editorImageChanges)
        
        // 이미지 변경사항을 별도로 처리
        const imageChanges = eventData.editorImageChanges
        delete eventData.editorImageChanges // DTO에서 제거
        
        // 삭제된 이미지 처리
        if (imageChanges.deletedImages && imageChanges.deletedImages.length > 0) {
            console.log('삭제할 이미지들:', imageChanges.deletedImages)
            // 백엔드에서 삭제된 이미지 URL을 기반으로 DB에서 삭제 처리
            eventData.deletedImageUrls = imageChanges.deletedImages
        }
        
        // 새로 추가된 이미지는 이미 에디터에서 업로드되었으므로 별도 처리 불필요
        if (imageChanges.newImages && imageChanges.newImages.length > 0) {
            console.log('새로 추가된 이미지들:', imageChanges.newImages)
        }
    }
    
    if (files && files.length > 0) {
        // 썸네일 플래그가 있는 파일들 처리
        const thumbnailFiles = files.filter(item => item.isThumbnail).map(item => item.file)
        const normalFiles = files.filter(item => !item.isThumbnail).map(item => item.file)
        
        // 썸네일 이미지들만 전송
        if (thumbnailFiles.length > 0) {
            return api.multipartPut({
                url: `/api/admin/event/${id}`,
                dto: eventData,
                files: thumbnailFiles,
                dtoKey: 'dto',
                fileKey: 'images'
            })
        } else {
            return api.put(`/api/admin/event/${id}`, eventData)
        }
    } else {
        return api.put(`/api/admin/event/${id}`, eventData)
    }
}

// 관리자용 이벤트 삭제
export const deleteEvent = (id) => {
    console.log("--------------deleteEvent>",id)
    return api.delete(`/api/admin/event/${id}`)
}

// 관리자용 이벤트 상세 조회
export const getEventById = (id) => {
    return api.get(`/api/admin/event/${id}`)
}