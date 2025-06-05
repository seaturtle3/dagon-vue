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
  }
}; 