import api from '@/lib/axios';

export const inquiryApi = {
  // 문의하기 목록 조회
  getInquiryList: (params) => {
    return api.get('/api/inquiry/admin', { params });
  },

  // 문의하기 상세 조회
  getInquiryDetail: (id) => {
    return api.get(`/api/inquiry/${id}`);
  },

  // 문의하기 등록
  createInquiry: (data) => {
    return api.post('/api/inquiry', data);
  },

  // 문의하기 수정
  updateInquiry: (id, data) => {
    return api.put(`/api/inquiry/${id}`, data);
  },

  // 문의하기 삭제
  deleteInquiry: (id) => {
    return api.delete(`/api/inquiry/${id}`);
  },

  // 답변 등록
  createReply: (inquiryId, replyData) => {
    return api.post(`/api/inquiry/${inquiryId}/answer`, replyData);
  },

  // 답변 수정
  updateReply: (inquiryId, replyData) => {
    return api.post(`/api/inquiry/${inquiryId}/answer`, replyData);
  },

  // 답변 삭제
  deleteReply: (inquiryId) => {
    return api.post(`/api/inquiry/${inquiryId}/answer`, { delete: true });
  }
}; 