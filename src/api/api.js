import axios from 'axios';

// Axios 인스턴스 생성 (기본 설정)
const apiClient = axios.create({
    baseURL: 'http://docs.yi.or.kr:8095/',
    // baseURL: 'http://localhost:8095/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

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
