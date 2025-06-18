import axios from 'axios';
import {BASE_URL} from "@/constants/baseUrl.js";

// Axios 인스턴스 생성 (기본 설정)
const apiClient = axios.create({
    baseURL: `${BASE_URL}/api`,
    // headers: {
    //     'Content-Type': 'application/json',
    // },
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


// 상품 등록 (파일 포함)
export const createProduct = (formData) => {
    return apiClient.post('/product/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // axios가 boundary 자동 설정
        }
    });
};
