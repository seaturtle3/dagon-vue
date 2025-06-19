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
import axios from '@/lib/axios'; // 실제 axios 인스턴스 경로에 맞게 수정

const router = useRouter();
const loadingMessage = ref('로그인 처리 중...');
const errorMessage = ref('');

onMounted(async () => {
  try {
    loadingMessage.value = '인증 정보를 확인하는 중...';

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (error) {
      errorMessage.value = '카카오 로그인에 실패했습니다.';
      setTimeout(() => router.push('/login?error=oauth_failed'), 2000);
      return;
    }

    if (success && token) {
      // 1. 토큰 저장
      localStorage.setItem('token', token);

      // 2. 토큰으로 직접 API 호출해서 유저 정보 조회
      loadingMessage.value = '사용자 정보를 가져오는 중...';
      const response = await axios.post('/api/mypage', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const user = response.data;
      console.log('user:', user);

      // 3. uname이 없으면 추가 정보 입력, 있으면 홈으로 이동
      if (!user?.uname || user.uname.trim() === '') {
        loadingMessage.value = '추가 정보 입력이 필요합니다.';
        setTimeout(() => {
          router.push('/additional-info');
        }, 1000);
      } else {
        loadingMessage.value = '로그인 완료! 홈페이지로 이동합니다...';
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } else {
      errorMessage.value = '인증 정보를 받지 못했습니다.';
      setTimeout(() => router.push('/login?error=no_token'), 2000);
    }
  } catch (error) {
    console.error('OAuth 콜백 처리 실패:', error);
    errorMessage.value = '로그인 처리 중 오류가 발생했습니다.';
    setTimeout(() => router.push('/login?error=callback_failed'), 2000);
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