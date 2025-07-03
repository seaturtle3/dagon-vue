// src/utils/authUtils.js
// 인증/로그아웃 관련 공통 유틸 함수

/**
 * 인증 정보(localStorage) 전체 삭제
 * - 로그아웃, 인증 실패, 토큰 만료 등에서 사용
 */
export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('loginType');
} 