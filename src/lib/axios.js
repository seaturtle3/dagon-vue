import axios from 'axios'
import {BASE_URL} from "@/constants/baseUrl.js";

console.log('BASE_URL:', BASE_URL)

const api = axios.create({
    baseURL: BASE_URL || 'http://localhost:8095',
    timeout: 30000,
    // headers: {
    //     'Content-Type': 'application/json',
    // }
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8'
    }
})

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        // localStorage에서 토큰 가져와서 헤더에 추가
        const token = localStorage.getItem('token')
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            config.headers.Authorization = `Bearer ${token}`
        }
        
        // data가 FormData인지 확인해서 Content-Type을 동적으로 설정
        if (config.data instanceof FormData) {
            // FormData일 때는 Content-Type을 axios가 자동으로 설정하도록 둔다
            config.headers['Content-Type'] = 'multipart/form-data'
        } else {
            // JSON 데이터일 때만 Content-Type을 명시
            config.headers['Content-Type'] = 'application/json'
        }

        console.log('API 요청:', config.method?.toUpperCase(), config.url, config.data)
        console.log('요청 헤더:', config.headers)
        return config
    },
    (error) => {
        console.error('API 요청 에러:', error)
        return Promise.reject(error)
    }
)

// 응답 인터셉터
api.interceptors.response.use(
    (response) => {
        console.log('API 응답:', response.status, response.config.url, response.data)
        return response
    },
    (error) => {
        // 에러 정보 추출
        const errorStatus = error.response?.status
        const errorData = error.response?.data
        const errorMessage = error.message
        const errorCode = error.code
        const requestUrl = error.config?.url
        const requestMethod = error.config?.method
        
        console.error('=== API 응답 에러 상세 정보 ===')
        console.error('요청 URL:', requestMethod?.toUpperCase(), requestUrl)
        console.error('에러 코드:', errorCode)
        console.error('에러 메시지:', errorMessage)
        console.error('HTTP 상태:', errorStatus)
        console.error('응답 데이터:', errorData)
        console.error('==============================')
        
        // 타임아웃 에러 처리
        if (errorCode === 'ECONNABORTED' || errorMessage.includes('timeout')) {
            console.error('요청 타임아웃: 서버 응답이 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
            console.error('요청 URL:', requestUrl)
            console.error('타임아웃 설정:', error.config?.timeout, 'ms')
        }
        
        // 네트워크 에러 처리
        if (!error.response) {
            console.error('네트워크 에러: 서버에 연결할 수 없습니다.')
            console.error('요청 URL:', requestUrl)
            console.error('BASE_URL:', BASE_URL)
            console.error('전체 URL:', error.config?.baseURL + requestUrl)
        }
        
        // 401 에러 시 토큰 삭제 및 로그인 페이지로 리다이렉트
        if (errorStatus === 401) {
            console.log('인증 실패, 토큰 삭제 및 로그인 페이지로 이동')
            localStorage.removeItem('token')
            const path = window.location.pathname
            if (path.startsWith('/admin')) {
                if (window.location.pathname !== '/admin/login') {
                    window.location.href = '/admin/login'
                }
            } else if (path.startsWith('/partner')) {
                if (window.location.pathname !== '/partner/login') {
                    window.location.href = '/partner/login'
                }
            } else {
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            }
        }
        
        return Promise.reject(error)
    }
)

// 멀티파트 업로드 전용 메서드 추가
api.multipartPost = async function({ url, dto, files, dtoKey = 'dto', fileKey = 'images' }) {
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
  return api.post(url, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// PUT용 멀티파트 업로드 메서드 추가
api.multipartPut = async function({ url, dto, files, dtoKey = 'dto', fileKey = 'images' }) {
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
  return api.put(url, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export default api