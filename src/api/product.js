import api from '@/lib/axios';

// 상품 등록 (파일 포함)
export const createProduct = (formData) => {
    return api.post('/product/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}; 