import api from '@/lib/axios';


// 상품 등록 (파일 포함)
export const createProduct = (formData) => {
    return api.post('api/product/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
};

export const updateProduct = (prodId, formData) => {
    return api.put(`/api/product/update/${prodId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
}

// 상품명 키워드로 검색 (신규 API)
export const getProductsByKeyword = (keyword) => {
    return api.get('/api/product/search', {
        params: { keyword, page: 0, size: 20 }
    });
}; 