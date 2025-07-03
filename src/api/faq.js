import api from '@/lib/axios'
import { useAdminAuthStore } from "@/store/auth/auth.js"

// 공용 API (사용자용)
export const fetchFAQs = (params) => {
    console.log('fetchFAQs API 호출됨, 파라미터:', params)

    const categoryId = params.categoryId
    let url = '/api/faq'

    // categoryId가 있으면 URL 경로에 추가
    if (categoryId) {
        url = `/api/faq/${categoryId}`
    }

    // Spring Boot Pageable 형식에 맞게 파라미터 조정
    const pageableParams = {
        page: params.page || 0,
        size: params.size || 100,
        isActive: params.isActive
    }
    
    // 검색 조건 추가
    const searchParams = {
        keyword: params.keyword
    }
    
    // 빈 값 제거
    Object.keys(pageableParams).forEach(key => {
        if (pageableParams[key] === null || pageableParams[key] === undefined) {
            delete pageableParams[key]
        }
    })
    Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === null || searchParams[key] === undefined || searchParams[key] === '') {
            delete searchParams[key]
        }
    })
    
    console.log('요청 URL:', url)
    console.log('API로 전달할 파라미터:', { ...pageableParams, ...searchParams })
    
    return api.get(url, {
        params: {
            ...pageableParams,
            ...searchParams
        }
    })
}

export const getFAQs = (params) => api.get('/api/faq', { params })
export const fetchFAQById = (id) => api.get(`/api/faq/${id}`)

// 관리자용 API
export const createFAQ = (faqData) => {
    console.log('createFAQ 호출됨:', { faqData })
    console.log('요청 URL:', '/api/admin/faq')
    
    // 카테고리 문자열을 ID로 변환하는 매핑
    const categoryMapping = {
        '일반회원': 1,
        '파트너': 2,
        '관리자': 3,
        '예약관련': 4,
        '결제관련': 5,
    }
    
    // @NotBlank 규칙에 맞는 데이터 검증
    if (!faqData.question || !faqData.question.trim()) {
        throw new Error('질문을 입력해주세요.')
    }
    
    if (!faqData.answer || !faqData.answer.trim()) {
        throw new Error('답변을 입력해주세요.')
    }
    
    // 공백 문자만으로 구성된 문자열 체크
    if (faqData.question.replace(/\s/g, '').length === 0) {
        throw new Error('질문에는 공백 외의 문자가 포함되어야 합니다.')
    }
    
    if (faqData.answer.replace(/\s/g, '').length === 0) {
        throw new Error('답변에는 공백 외의 문자가 포함되어야 합니다.')
    }
    
    // 서버에서 기대하는 데이터 형식으로 변환
    const requestData = {
        question: faqData.question.trim(),
        answer: faqData.answer.trim(),
        displayOrder: faqData.displayOrder || 1,
        isActive: faqData.isActive !== undefined ? faqData.isActive : true,
        categoryId: categoryMapping[faqData.category] || 1
    }
    
    console.log('서버로 보낼 데이터:', requestData)
    
    return api.post('/api/admin/faq', requestData).then(response => {
        console.log('createFAQ 성공:', response)
        return response
    }).catch(error => {
        console.error('createFAQ 실패:', error)
        console.error('에러 응답:', error.response)
        if (error.response && error.response.data) {
            console.error('서버 에러 상세:', error.response.data)
        }
        throw error
    })
}

export const updateFAQ = (id, faqData) => {
    console.log('updateFAQ 호출됨:', { id, faqData })
    
    // 카테고리 문자열을 ID로 변환하는 매핑
    const categoryMapping = {
        '일반회원': 1,
        '파트너': 2,
        '관리자': 3,
        '예약관련': 4,
        '결제관련': 5,
    }
    
    // @NotBlank 규칙에 맞는 데이터 검증
    if (!faqData.question || !faqData.question.trim()) {
        throw new Error('질문을 입력해주세요.')
    }
    
    if (!faqData.answer || !faqData.answer.trim()) {
        throw new Error('답변을 입력해주세요.')
    }
    
    // 공백 문자만으로 구성된 문자열 체크
    if (faqData.question.replace(/\s/g, '').length === 0) {
        throw new Error('질문에는 공백 외의 문자가 포함되어야 합니다.')
    }
    
    if (faqData.answer.replace(/\s/g, '').length === 0) {
        throw new Error('답변에는 공백 외의 문자가 포함되어야 합니다.')
    }
    
    // 서버에서 기대하는 데이터 형식으로 변환
    const requestData = {
        question: faqData.question.trim(),
        answer: faqData.answer.trim(),
        displayOrder: faqData.displayOrder || 1,
        isActive: faqData.isActive !== undefined ? faqData.isActive : true,
        categoryId: categoryMapping[faqData.category] || 1
    }
    
    console.log('서버로 보낼 데이터:', requestData)
    
    return api.put(`/api/admin/faq/${id}`, requestData).then(response => {
        console.log('updateFAQ 성공:', response)
        return response
    }).catch(error => {
        console.error('updateFAQ 실패:', error)
        console.error('에러 응답:', error.response)
        if (error.response && error.response.data) {
            console.error('서버 에러 상세:', error.response.data)
        }
        throw error
    })
}

export const deleteFAQ = (id) => {
    console.log('deleteFAQ API 호출됨:', { id })
    console.log('요청 URL:', `/api/admin/faq/${id}`)
    
    return api.delete(`/api/admin/faq/${id}`).then(response => {
        console.log('deleteFAQ 성공:', response)
        return response
    }).catch(error => {
        console.error('deleteFAQ 실패:', error)
        console.error('에러 응답:', error.response)
        if (error.response && error.response.data) {
            console.error('서버 에러 상세:', error.response.data)
        }
        throw error
    })
}

export const getFAQById = (id) => {
    return api.get(`/api/admin/faq/${id}`)
}

// 관리자용 FAQ 목록 조회 (페이징)
export const getAdminFAQs = (params) => {
    console.log('getAdminFAQs API 호출됨, 파라미터:', params)
    
    // Spring Boot Pageable 형식에 맞게 파라미터 조정
    const pageableParams = {
        page: params.page || 0,
        size: params.size || 10
    }
    
    // 검색 조건 추가
    const searchParams = {
        keyword: params.keyword,
        categoryId: params.categoryId,
        isActive: params.isActive
    }
    
    // 빈 값 제거
    Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === null || searchParams[key] === undefined || searchParams[key] === '') {
            delete searchParams[key]
        }
    })
    
    console.log('API로 전달할 파라미터:', { ...pageableParams, ...searchParams })
    
    return api.get('/api/admin/faq', {
        params: {
            ...pageableParams,
            ...searchParams
        }
    })
} 