import axios from './axios';

export const inquiryApi = {
  // 문의하기 목록 조회
  getInquiryList: (params) => {
    return axios.get('/api/inquiry', { params });
  },

  // 문의하기 상세 조회
  getInquiryDetail: (id) => {
    return axios.get(`/api/inquiry/${id}`);
  },

  // 문의하기 등록
  createInquiry: (data) => {
    return axios.post('/api/inquiry', data);
  },

  // 문의하기 수정
  updateInquiry: (id, data) => {
    return axios.put(`/api/inquiry/${id}`, data);
  },

  // 문의하기 삭제
  deleteInquiry: (id) => {
    return axios.delete(`/api/inquiry/${id}`);
  },

  // 답변 등록
  createReply: (inquiryId, replyData) => {
    return axios.post(`/api/inquiry/${inquiryId}/reply`, replyData);
  },

// 답변 수정
  updateReply: (inquiryId, replyData) => {
    return axios.put(`/api/inquiry/${inquiryId}/reply`, replyData);
  },

// 답변 삭제
  deleteReply: (inquiryId) => {
    return axios.delete(`/api/inquiry/${inquiryId}/reply`);
  }
}; 