<template>
  <div class="additional-info-container">
    <div class="additional-info-box">
      <!-- 로고 -->
      <div class="logo-section">
        <h1 class="logo">DAGON</h1>
        <p class="subtitle">낚시의 모든 것</p>
      </div>

      <div class="form-container">
        <h2 class="form-title">추가 정보 입력</h2>
        <p class="form-description">서비스 이용을 위해 추가 정보를 입력해주세요.</p>
        
        <form @submit.prevent="handleSubmit" class="additional-info-form">
          <div class="form-group">
            <label>이름 *</label>
            <div class="input-wrapper">
              <input
                v-model="uname"
                type="text"
                placeholder="이름을 입력하세요"
                required
                :disabled="loading"
              />
              <span class="input-icon">
                <i class="fas fa-user"></i>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>전화번호 *</label>
            <div class="input-wrapper">
              <input
                v-model="phone"
                type="tel"
                placeholder="010-0000-0000"
                required
                :disabled="loading"
                @input="formatPhoneNumber"
              />
              <span class="input-icon">
                <i class="fas fa-phone"></i>
              </span>
            </div>
            <small class="input-hint">하이픈(-) 없이 숫자만 입력해주세요.</small>
          </div>

          <button type="submit" class="submit-button" :disabled="loading || !isFormValid">
            <span v-if="loading" class="spinner"></span>
            <span>{{ loading ? '처리 중...' : '완료' }}</span>
          </button>
        </form>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/login/loginStore.js';
import axios from '@/lib/axios';

const router = useRouter();
const authStore = useAuthStore();

// 폼 데이터
const uname = ref('');
const phone = ref('');
const loading = ref(false);
const errorMessage = ref('');

// 폼 유효성 검사
const isFormValid = computed(() => {
  return uname.value.trim() && phone.value.replace(/[^0-9]/g, '').length >= 10;
});

// 전화번호 포맷팅
const formatPhoneNumber = () => {
  // 숫자만 추출
  const numbers = phone.value.replace(/[^0-9]/g, '');
  
  // 11자리 제한
  if (numbers.length > 11) {
    phone.value = numbers.slice(0, 11);
  } else {
    phone.value = numbers;
  }
};

// 추가 정보 제출
const handleSubmit = async () => {
  if (!isFormValid.value) {
    errorMessage.value = '모든 필수 항목을 입력해주세요.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    // 토큰 가져오기
    const token = localStorage.getItem('tempToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    // 추가 정보 업데이트 API 호출
    const response = await axios.put('/api/users/additional-info', {
      uname: uname.value.trim(),
      phone: phone.value.replace(/[^0-9]/g, '')
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      // 임시 토큰을 정식 토큰으로 변경
      localStorage.removeItem('tempToken');
      localStorage.setItem('token', token);
      
      // 사용자 정보 새로고침
      try {
        await authStore.getUserInfo();
      } catch (err) {
        console.warn('사용자 정보 조회 실패:', err);
      }

      // 홈페이지로 리다이렉트
      router.push('/');
    } else {
      throw new Error(response.data.message || '추가 정보 저장에 실패했습니다.');
    }
  } catch (error) {
    console.error('추가 정보 저장 실패:', error);
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data;
    } else {
      errorMessage.value = '추가 정보 저장에 실패했습니다. 다시 시도해주세요.';
    }
  } finally {
    loading.value = false;
  }
};

// 컴포넌트 마운트 시 토큰 확인
onMounted(() => {
  const token = localStorage.getItem('tempToken');
  if (!token) {
    // 임시 토큰이 없으면 로그인 페이지로 리다이렉트
    router.push('/login?error=no_temp_token');
  }
});
</script>

<style scoped>
.additional-info-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.additional-info-box {
  width: 100%;
  max-width: 500px;
  padding: 3rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1a73e8;
}

.subtitle {
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.form-container {
  animation: fadeIn 0.3s ease;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
}

.form-description {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.additional-info-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #1a73e8;
}

.input-wrapper input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1rem;
}

.input-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.submit-button {
  padding: 0.75rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: #1557b0;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  font-size: 0.875rem;
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 