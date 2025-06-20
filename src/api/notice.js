// notice.js
// 공지사항 API
import api from '@/lib/axios.js';

export const getNotices = (page = 0, size = 10, searchDTO = {}) => {
    return api.get('/notices', {
        params: {
            page,
            size,
            ...searchDTO // BoardSearchDTO 형태의 검색 조건이 있다면 여기에 포함
        }
    });
};

// 개별 공지사항 상세 보기
export const getNoticeById = (id) => {
    return api.get(`/notices/${id}`);
};

// 공지사항 작성 (관리자용)
export const createNotice = (noticeData) => {
    return api.post('/notices', noticeData);
};

// 공지사항 수정 (관리자용)
export const updateNotice = (id, noticeData) => {
    return api.put(`/notices/${id}`, noticeData);
};

// 공지사항 삭제 (관리자용)
export const deleteNotice = (id) => {
    return api.delete(`/notices/${id}`);
};

// 공지사항 고정/해제 (관리자용)
export const toggleNoticeTop = (id) => {
    return api.patch(`/notices/${id}/toggle-top`);
};

// 공지사항 긴급/해제 (관리자용)
export const toggleNoticeUrgent = (id) => {
    return api.patch(`/notices/${id}/toggle-urgent`);
};