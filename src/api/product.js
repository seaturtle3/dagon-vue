import api from '@/lib/axios';


// 상품 등록 (파일 포함, multipartPost 사용)
export const createProduct = (product, files) => {
    return api.multipartPost({
        url: '/api/product/create',
        dto: product,
        files: files,
        dtoKey: 'dto', // 서버에서 기대하는 키
        fileKey: 'images' // 여러 파일 지원
    });
};


// 상품명 키워드로 검색 (신규 API)
export const getProductsByKeyword = (keyword) => {
    return api.get('/api/product/search', {
        params: { keyword, page: 0, size: 20 }
    });
};

// 상품 수정 (파일 포함, multipartPost 사용)
export const updateProduct = (prodId, product, files) => {
    return api.multipartPut({
        url: `/api/product/update/${prodId}`,
        dto: product,
        files: files,
        dtoKey: 'product', // 서버에서 기대하는 키
        fileKey: 'images' // 여러 파일 지원
    });
}; 