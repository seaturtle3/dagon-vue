import axios from 'axios'

/**
 * 멀티파트 파일 업로드 전용 axios 유틸리티 (api 인스턴스 사용 안 함)
 * @param {string} url - 업로드할 API 엔드포인트
 * @param {Object} dto - JSON으로 보낼 데이터 객체
 * @param {File|File[]} files - 업로드할 파일 또는 파일 배열
 * @param {string} [dtoKey='dto'] - dto의 FormData key명
 * @param {string} [fileKey='images'] - 파일의 FormData key명
 * @returns {Promise<any>} - axios 응답
 */
export default async function axiosMultipart({ url, dto, files, dtoKey = 'dto', fileKey = 'images' }) {
  const formData = new FormData();

  const blob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
  formData.append(dtoKey, blob);

  if (Array.isArray(files)) {
    files.forEach(file => {
      if (file) formData.append(fileKey, file);
    });
  } else if (files) {
    formData.append(fileKey, files);
  }

  const token = localStorage.getItem('token');
  const response = await axios.post(url, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response;
} 