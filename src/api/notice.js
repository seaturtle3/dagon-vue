// 공지사항 API
export const getNotices = (page = 0, size = 5, searchDTO = {}) => {
    return apiClient.get('/notices', {
        params: {
            page,
            size,
            ...searchDTO // BoardSearchDTO 형태의 검색 조건이 있다면 여기에 포함
        }
    });
};

// 개별 공지사항 상세 보기
export const getNoticeById = (id) => {
    return apiClient.get(`/notices/${id}`);
};