import axiosInstance from './axios';

const API_URL = '/api';

export const partnerService = {
    // 파트너 정보 조회
    getPartnerInfo() {
        return axiosInstance.post(`${API_URL}/mypage`);
    },

    // 파트너 상품 목록 조회
    getPartnerProducts() {
        return axiosInstance.get(`${API_URL}/partner/product/my-products`);
    },

    // 파트너 상품 등록
    registerProduct(productData) {
        // FormData인 경우 Content-Type을 자동으로 설정하도록 함
        return axiosInstance.post(`${API_URL}/product/create`, productData);
    },

    // 파트너 상품 상세 조회
    getProductDetail(prodId) {
        return axiosInstance.get(`${API_URL}/partner/product/${prodId}`);
    },

    // 상품 썸네일 URL 가져오기
    getThumbnailUrl(filename) {
        if (!filename) {
            return '/src/assets/images/default-product.jpg';
        }
        return `http://localhost:8095/uploads/${filename}`;
    },

    // 상품 등록 폼 데이터 생성
    createProductFormData(formData, file) {
        const form = new FormData();
        // product 객체를 JSON 문자열로 변환하여 전송
        form.append(
            "product",
            new Blob([JSON.stringify(formData)], {type: "application/json"})
        );

        if (file) {
            form.append("thumbnailFile", file);
        }

        return form;
    },

    // 상품 등록 처리
    async handleProductRegistration(formData, file, router) {
        try {
            const form = this.createProductFormData(formData, file);
            const response = await this.registerProduct(form);
            
            if (response.data) {
                alert('등록 성공');
                router.push('/partner/product/list');
                return true;
            }
        } catch (err) {
            console.error('상품 등록 실패:', err);
            if (err.response?.data) {
                if (err.response.status === 401) {
                    alert('로그인이 필요합니다.');
                    router.push('/login');
                } else {
                    alert(`등록 실패: ${err.response.data.message || '알 수 없는 오류가 발생했습니다.'}`);
                }
            } else {
                alert('상품 등록에 실패했습니다. 다시 시도해주세요.');
            }
            return false;
        }
    }
};
