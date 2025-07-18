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

/**
 * localhost URL을 실제 도메인으로 변환 (HTTPS)
 * @param {string} url - 변환할 URL
 * @returns {string} 변환된 URL
 */
export function convertLocalhostToDomain(url) {
  if (!url) return url;
  if (url.startsWith('http://localhost:8095')) {
    return url.replace('http://localhost:8095', 'https://docs.yi.or.kr:8097');
  }
  if (url.startsWith('http://localhost:8097')) {
    return url.replace('http://localhost:8097', 'https://docs.yi.or.kr:8097');
  }
  return url;
}

/**
 * 절대 URL을 상대 URL로 변환 (Mixed Content 방지)
 * @param {string} url - 변환할 URL
 * @returns {string} 변환된 URL
 */
export function convertToRelativeUrl(url) {
  if (!url) return url;
  
  // 이미 상대 경로인 경우 그대로 반환
  if (url.startsWith('/')) {
    return url;
  }
  
  // data URL인 경우 그대로 반환
  if (url.startsWith('data:')) {
    return url;
  }
  
  // HTTP/HTTPS URL을 상대 경로로 변환
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (e) {
      console.warn('URL 변환 실패:', url, e);
      return url;
    }
  }
  
  return url;
}

/**
 * JWT 토큰에서 ADMIN/SUPER_ADMIN 권한 여부 판별
 * @param {string} token
 * @returns {boolean}
 */
export function isAdminToken(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role || payload.auth || payload.roles || payload.ROLE;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  } catch (e) {
    return false;
  }
} 