import api from '@/lib/axios';

// 파트너 신청 등록 (이미지 포함)
export const registerPartnerApplication = (formData) => {
  return api.post('/api/partners/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// (추가) 파트너 신청 목록 조회 등 필요한 API도 여기에 추가 가능 