import api from './axios';

export const myPageAPI = {
  // 내 정보 조회
  async getMyInfo() {
    try {
      const response = await api.post('/api/mypage');
      console.log('API Response:', response); // 디버깅용 로그
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 내 정보 수정
  async updateMyInfo(formData) {
    try {
      const response = await api.post('/api/mypage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 비밀번호 변경
  async changePassword(passwordData) {
    try {
      const response = await api.put('/api/mypage/password', passwordData);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 포인트 및 레벨 조회
  async getPointAndLevel() {
    try {
      const response = await api.get('/api/mypage/point');
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 회원 탈퇴
  async deleteAccount(password) {
    try {
      const response = await api.delete('/api/mypage/delete', {
        data: { password }
      });
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 이름으로 사용자 정보 조회
  async getUserByName(uname) {
    try {
      const response = await api.get(`/api/mypage/me?uname=${uname}`);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 사용자의 알람 목록 조회
  async getNotifications(receiverUno) {
    try {
      console.log('알림 조회 API 호출 시작 - 사용자 번호:', receiverUno);
      const response = await api.get(`/api/notifications/user/${receiverUno}`);
      console.log('알림 API 응답 전체:', response);
      const result = Array.isArray(response.data) ? response.data : [];
      console.log('처리된 알림 데이터:', result);
      return result;
    } catch (error) {
      console.error('알림 API 에러:', error);
      console.error('에러 상세:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // 알람 읽음 처리
  async markNotificationAsRead(id) {
    try {
      const response = await api.put(`/api/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 내 예약 목록 조회
  async getMyReservations() {
    try {
      console.log('예약 목록 API 호출 시작');
      const token = localStorage.getItem('token');
      console.log('현재 토큰:', token);
      
      const response = await api.get('/api/reservation/my');
      console.log('예약 목록 API 응답 전체:', response);
      console.log('예약 목록 데이터:', response.data);
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('예약 목록 조회 API 에러:', error);
      console.error('에러 상세:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // 예약 취소
  async cancelReservation(id) {
    try {
      const response = await api.delete(`/api/reservation/${id}`);
      return response.data;
    } catch (error) {
      console.error('예약 취소 API 에러:', error);
      throw error;
    }
  },

  // 내 문의 내역 조회
  async getMyInquiries() {
    try {
      console.log('문의 내역 API 호출 시작');
      const response = await api.get('/api/inquiry/my-inquiries');
      console.log('문의 내역 조회 결과:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('문의 내역 조회 API 에러:', error);
      throw error;
    }
  }
}; 