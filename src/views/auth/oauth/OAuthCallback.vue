<template>
  <div class="oauth-callback">
    <div class="loading-container">
      <div class="spinner"></div>
      <p>{{ loadingMessage }}</p>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/login/loginStore.js';

const router = useRouter();
const authStore = useAuthStore();
const loadingMessage = ref('로그인 처리 중...');
const errorMessage = ref('');

onMounted(async () => {
  try {
    loadingMessage.value = '인증 정보를 확인하는 중...';
    
    // URL에서 토큰 정보 추출 (백엔드에서 JWT 토큰을 쿼리 파라미터로 전달)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const isFirstLogin = urlParams.get('firstLogin') === 'true';

    console.log('OAuth Callback - token:', token ? 'present' : 'missing', 'success:', success, 'error:', error, 'firstLogin:', isFirstLogin);

    if (error) {
      console.error('OAuth 로그인 실패:', error);
      errorMessage.value = '카카오 로그인에 실패했습니다.';
      setTimeout(() => {
        router.push('/login?error=oauth_failed');
      }, 2000);
      return;
    }

    if (success && token) {
      if (isFirstLogin) {
        // 첫 로그인인 경우 임시 토큰으로 저장하고 추가 정보 입력 페이지로 이동
        localStorage.setItem('tempToken', token);
        loadingMessage.value = '추가 정보 입력 페이지로 이동합니다...';
        setTimeout(() => {
          router.push('/additional-info');
        }, 1000);
      } else {
        // 기존 사용자인 경우 정상 로그인 처리
        loadingMessage.value = '로그인 정보를 저장하는 중...';
        
        // 토큰을 localStorage에 저장
        localStorage.setItem('token', token);
        
        // 사용자 정보 가져오기 (선택사항)
        try {
          loadingMessage.value = '사용자 정보를 가져오는 중...';
          await authStore.getUserInfo();
        } catch (err) {
          console.warn('사용자 정보 조회 실패:', err);
        }

        loadingMessage.value = '로그인 완료! 홈페이지로 이동합니다...';
        
        // 홈페이지로 리다이렉트
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } else {
      // 토큰이 없는 경우 로그인 페이지로 리다이렉트
      console.warn('토큰이 없거나 성공 플래그가 없습니다.');
      errorMessage.value = '인증 정보를 받지 못했습니다.';
      setTimeout(() => {
        router.push('/login?error=no_token');
      }, 2000);
    }
  } catch (error) {
    console.error('OAuth 콜백 처리 실패:', error);
    errorMessage.value = '로그인 처리 중 오류가 발생했습니다.';
    setTimeout(() => {
      router.push('/login?error=callback_failed');
    }, 2000);
  }
});
</script>

<style scoped>
.oauth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.loading-container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.error-text {
  color: red;
  font-size: 1rem;
  margin: 0.5rem 0 0;
}
</style> 