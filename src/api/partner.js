import api from '@/lib/axios';
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const API_URL = '/api';

export const partnerService = {
    // 파트너 정보 조회
    getPartnerInfo() {
        return api.post(`${API_URL}/mypage`);
    },

    // 파트너 상품 목록 조회
    getPartnerProducts() {
        return api.get(`${API_URL}/partner/product/my-products`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    // 파트너 상품 등록
    registerProduct(productData) {
        // FormData인 경우 Content-Type을 자동으로 설정하도록 함
        return api.post(`${API_URL}/product/create`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 파트너 상품 상세 조회
    getProductDetail(prodId) {
        return api.get(`${API_URL}/partner/product/${prodId}`);
    },

    // 상품 썸네일 URL 가져오기
    getThumbnailUrl(filename) {
        if (!filename) {
            return '/images/default-product.jpg';
        }
        return `${IMAGE_BASE_URL}/${filename}`;
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

    // 파트너 상품 삭제
    deleteProduct(prodId) {
        return api.delete(`${API_URL}/partner/product/delete/${prodId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    // 파트너 예약 목록 조회
    getPartnerReservations() {
        return api.get(`${API_URL}/reservation/partner`);
    },

    // 예약 취소
    cancelReservation(reservationId) {
        return api.delete(`${API_URL}/reservation/${reservationId}`);
    },

    // 예약 상세 조회
    getReservationDetail(reservationId) {
        return api.get(`${API_URL}/reservation/${reservationId}`);
    },

    // 조황정보 목록 조회
    getFishingReports(prodId = null) {
        if (prodId) {
            return api.get(`${API_URL}/fishing-report/mine/${prodId}`);
        } else {
            return api.get(`${API_URL}/fishing-report/mine`);
        }
    },

    // 조황정보 상세 조회
    getFishingReportDetail(frId) {
        return api.get(`${API_URL}/fishing-report/${frId}`);
    },

    // 조황정보 생성
    createFishingReport(reportData) {
        return api.post(`${API_URL}/fishing-report`, reportData);
    },

    // 조황정보 업데이트
    updateFishingReport(frId, reportData) {
        return api.put(`${API_URL}/fishing-report/${frId}`, reportData);
    },

    // 조황정보 삭제
    deleteFishingReport(frId) {
        return api.delete(`${API_URL}/fishing-report/${frId}`);
    },

    // 파트너 대시보드 예약 수 조회
    getReservationCount(uno) {
        return api.get(`${API_URL}/partner/dashboard/reservation-count?uno=${uno}`);
    },

    // 파트너 대시보드 상품 수 조회
    getProductCount(uno) {
        return api.get(`${API_URL}/partner/dashboard/product-count?uno=${uno}`);
    },

    // 파트너 대시보드 오늘 예약 수 조회
    getTodayReservationCount(uno) {
        return api.get(`${API_URL}/partner/dashboard/today-reservation-count?uno=${uno}`);
    },

    // 파트너 대시보드 대기 문의 수 조회
    getUnansweredInquiryCount(uno) {
        return api.get(`${API_URL}/partner/dashboard/unanswered-inquiry-count?uno=${uno}`);
    },

    // 파트너 대시보드 최근 예약 목록 조회
    getRecentReservations(uno) {
        return api.get(`${API_URL}/partner/dashboard/recent-reservations?uno=${uno}`);
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
    },

    // 파트너 상품 복구
    restoreProduct(prodId) {
        return api.put(`${API_URL}/partner/product/restore/${prodId}`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    // 파트너의 모든 상품 목록 조회 (공개/비공개 포함)
    getPartnerAllProducts() {
        return api.get(`${API_URL}/partner/product/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    // 상품 신고
    reportProduct(prodId, reason) {
        return api.post(`${API_URL}/reports/product/${prodId}`, reason, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'text/plain'
            }
        });
    },

    // 조황정보 신고
    reportFishingReport(frId, reason) {
        return api.post(`${API_URL}/reports/fishing-report/${frId}`, reason, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'text/plain'
            }
        });
    },

    // 조황정보 댓글 신고
    reportFishingReportComment(commentId, reason) {
        return api.post(`${API_URL}/reports/fishing-report-comment/${commentId}`, reason, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'text/plain'
            }
        });
    },

    // 조행기 신고
    reportFishingPost(fdId, reason) {
        return api.post(`${API_URL}/reports/fishing-post/${fdId}`, reason, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'text/plain'
            }
        });
    },

    // 조행기 댓글 신고
    reportFishingPostComment(commentId, reason) {
        return api.post(`${API_URL}/reports/fishing-post-comment/${commentId}`, reason, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'text/plain'
            }
        });
    }
};
