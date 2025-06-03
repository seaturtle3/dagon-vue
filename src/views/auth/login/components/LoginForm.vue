<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/login/loginStore.js';
import axios from '@/lib/axios';

// 현재 보여줄 화면
const currentView = ref('login');

// 로그인 관련 상태
const username = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const authStore = useAuthStore();
const router = useRouter();

// 아이디 찾기 관련 상태
const findIdEmail = ref('');
const findIdLoading = ref(false);
const foundUserId = ref('');

// 비밀번호 찾기 관련 상태
const findPasswordId = ref('');
const findPasswordName = ref('');
const findPasswordEmail = ref('');
const findPasswordLoading = ref(false);
const tempPassword = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changePasswordLoading = ref(false);

// 비밀번호 변경 관련 상태
const changePasswordId = ref('');

// 로그인 화면으로 돌아가기
const goBackToLogin = () => {
  currentView.value = 'login';
  errorMessage.value = '';
  successMessage.value = '';
  foundUserId.value = '';
  findIdEmail.value = '';
  findPasswordId.value = '';
  findPasswordName.value = '';
  findPasswordEmail.value = '';
  tempPassword.value = '';
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  changePasswordId.value = '';
};

// 로그인 처리
const handleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await authStore.login(username.value, password.value);
    router.push('/');
  } catch (err) {
    if (err.response && err.response.data) {
      errorMessage.value = err.response.data;
    } else {
      errorMessage.value = '로그인 중 알 수 없는 오류가 발생했습니다.';
    }
  }
};

// 아이디 찾기 처리
const handleFindId = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  foundUserId.value = '';
  findIdLoading.value = true;

  try {
    const response = await axios.get('/api/users/find-id', {
      params: { email: findIdEmail.value }
    });

    if (response.data && response.data.uid) {
      foundUserId.value = response.data.uid;
      successMessage.value = '아이디를 찾았습니다.';
    }
  } catch (err) {
    if (err.response && err.response.data) {
      errorMessage.value = err.response.data;
    } else {
      errorMessage.value = '아이디 찾기에 실패했습니다. 다시 시도해주세요.';
    }
  } finally {
    findIdLoading.value = false;
  }
};

// 비밀번호 유효성 검사 함수
const validatePassword = (password) => {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!isLongEnough) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }
  if (!hasLetter || !hasNumber) {
    return '비밀번호는 영문자와 숫자를 모두 포함해야 합니다.';
  }
  return '';
};

// 임시 비밀번호 발급
const handleFindPassword = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  findPasswordLoading.value = true;

  try {
    const response = await axios.post('/api/find-password', {
      uid: findPasswordId.value,
      uname: findPasswordName.value,
      email: findPasswordEmail.value
    });

    if (response.data && response.data.tempPassword) {
      tempPassword.value = response.data.tempPassword;
      changePasswordId.value = findPasswordId.value; // 아이디 자동 입력
      successMessage.value = '임시 비밀번호가 발급되었습니다. 새로운 비밀번호로 변경해주세요.';
    }
  } catch (err) {
    if (err.response && err.response.data) {
      errorMessage.value = '등록되지 않은 사용자입니다. 아이디, 이름, 이메일을 다시 확인해주세요.';
    } else {
      errorMessage.value = '임시 비밀번호 발급에 실패했습니다. 다시 시도해주세요.';
    }
  } finally {
    findPasswordLoading.value = false;
  }
};

// 비밀번호 변경
const handleChangePassword = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  // 새 비밀번호 유효성 검사
  const passwordError = validatePassword(newPassword.value);
  if (passwordError) {
    errorMessage.value = passwordError;
    return;
  }

  // 비밀번호 확인
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '새 비밀번호가 일치하지 않습니다.';
    return;
  }

  // 임시 비밀번호 확인
  if (currentPassword.value !== tempPassword.value) {
    errorMessage.value = '임시 비밀번호가 일치하지 않습니다.';
    return;
  }

  changePasswordLoading.value = true;

  try {
    const response = await axios.put('/api/password', {
      userId: changePasswordId.value,
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    });

    if (response.data && response.data.message) {
      successMessage.value = response.data.message;
      setTimeout(() => {
        goBackToLogin();
      }, 2000);
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      errorMessage.value = err.response.data.error;
    } else {
      errorMessage.value = '비밀번호 변경에 실패했습니다. 다시 시도해주세요.';
    }
  } finally {
    changePasswordLoading.value = false;
  }
};

// 회원가입 페이지로 이동
const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 로고 -->
      <div class="logo-section">
        <h1 class="logo">DΛGON</h1>
        <p class="subtitle">낚시의 모든 것</p>
      </div>

      <!-- 로그인 폼 -->
      <div v-if="currentView === 'login'" class="form-container">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>아이디</label>
            <div class="input-wrapper">
              <input
                v-model="username"
                type="text"
                placeholder="아이디를 입력하세요"
              />
              <span class="input-icon">
                <i class="fas fa-user"></i>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>비밀번호</label>
            <div class="input-wrapper">
              <input
                v-model="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
              />
              <span class="input-icon">
                <i class="fas fa-lock"></i>
              </span>
            </div>
          </div>

          <!-- 로그인 버튼 -->
          <button type="submit" class="login-button" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="spinner"></span>
            <span>{{ authStore.loading ? '로그인 중...' : '로그인' }}</span>
          </button>


          <!-- 카카오 로그인 -->
          <div class="social-login">
            <button type="button" class="social-button kakao">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#000000" d="M9 1.5C4.5 1.5 0.9 4.37 0.9 7.88c0 2.25 1.51 4.22 3.78 5.33l-0.95 3.58c-0.09 0.32 0.28 0.57 0.55 0.37l4.27-2.92c0.14 0.02 0.29 0.02 0.45 0.02 4.5 0 8.1-2.87 8.1-6.38S13.5 1.5 9 1.5z"/>
              </svg>
              카카오로 계속하기
            </button>
          </div>

          <!-- 회원가입 버튼 -->
          <button type="button" class="register-link" @click="goToRegister">
            계정이 없으신가요? 회원가입하기
          </button>

          <!-- 아이디/비밀번호 찾기 -->
          <div class="find-links">
            <a href="#" @click.prevent="currentView = 'findId'">아이디 찾기</a>
            <span class="divider-dot">·</span>
            <a href="#" @click.prevent="currentView = 'findPassword'">비밀번호 찾기</a>
          </div>




        </form>
      </div>

      <!-- 아이디 찾기 폼 -->
      <div v-else-if="currentView === 'findId'" class="form-container">
        <form @submit.prevent="handleFindId" class="login-form">
          <div class="form-group">
            <label>이메일</label>
            <div class="input-wrapper">
              <input
                v-model="findIdEmail"
                type="email"
                placeholder="가입시 등록한 이메일을 입력하세요"
                required
              />
              <span class="input-icon">
                <i class="fas fa-envelope"></i>
              </span>
            </div>
          </div>

          <button type="submit" class="login-button" :disabled="findIdLoading">
            <span v-if="findIdLoading" class="spinner"></span>
            <span>{{ findIdLoading ? '처리 중...' : '아이디 찾기' }}</span>
          </button>

          <!-- 조회된 아이디 표시 -->
          <div v-if="foundUserId" class="found-id-box">
            <p class="found-id-title">조회된 아이디</p>
            <p class="found-id-value">{{ foundUserId }}</p>
          </div>

          <button type="button" class="back-button" @click="goBackToLogin">
            로그인으로 돌아가기
          </button>
        </form>
      </div>

      <!-- 비밀번호 찾기 폼 -->
      <div v-else-if="currentView === 'findPassword'" class="form-container">
        <!-- 임시 비밀번호 발급 폼 -->
        <form v-if="!tempPassword" @submit.prevent="handleFindPassword" class="login-form">
          <div class="form-group">
            <label>아이디</label>
            <div class="input-wrapper">
              <input
                v-model="findPasswordId"
                type="text"
                placeholder="아이디를 입력하세요"
                required
              />
              <span class="input-icon">
                <i class="fas fa-user"></i>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>이름</label>
            <div class="input-wrapper">
              <input
                v-model="findPasswordName"
                type="text"
                placeholder="이름을 입력하세요"
                required
              />
              <span class="input-icon">
                <i class="fas fa-user"></i>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>이메일</label>
            <div class="input-wrapper">
              <input
                v-model="findPasswordEmail"
                type="email"
                placeholder="가입시 등록한 이메일을 입력하세요"
                required
              />
              <span class="input-icon">
                <i class="fas fa-envelope"></i>
              </span>
            </div>
          </div>

          <button type="submit" class="login-button" :disabled="findPasswordLoading">
            <span v-if="findPasswordLoading" class="spinner"></span>
            <span>{{ findPasswordLoading ? '처리 중...' : '임시 비밀번호 발급' }}</span>
          </button>

          <button type="button" class="back-button" @click="goBackToLogin">
            로그인으로 돌아가기
          </button>
        </form>

        <!-- 비밀번호 변경 폼 -->
        <form v-else @submit.prevent="handleChangePassword" class="login-form">
          <!-- 임시 비밀번호 표시 -->
          <div class="temp-password-box">
            <p class="temp-password-title">발급된 임시 비밀번호</p>
            <p class="temp-password-value">{{ tempPassword }}</p>
            <p class="temp-password-info">아래 정보를 입력하여 비밀번호를 변경해주세요.</p>
          </div>

          <!-- 아이디 입력 -->
          <div class="form-group">
            <label>아이디</label>
            <div class="input-wrapper">
              <input
                v-model="changePasswordId"
                type="text"
                placeholder="아이디를 입력하세요"
                required
              />
              <span class="input-icon">
                <i class="fas fa-user"></i>
              </span>
            </div>
          </div>

          <!-- 임시 비밀번호 입력 -->
          <div class="form-group">
            <label>임시 비밀번호</label>
            <div class="input-wrapper">
              <input
                v-model="currentPassword"
                type="password"
                placeholder="발급받은 임시 비밀번호를 입력하세요"
                required
              />
              <span class="input-icon">
                <i class="fas fa-lock"></i>
              </span>
            </div>
          </div>

          <!-- 새 비밀번호 입력 -->
          <div class="form-group">
            <label>새 비밀번호</label>
            <div class="input-wrapper">
              <input
                v-model="newPassword"
                type="password"
                placeholder="영문자와 숫자를 포함한 8자 이상"
                required
              />
              <span class="input-icon">
                <i class="fas fa-lock"></i>
              </span>
            </div>
            <small class="password-hint">* 영문자와 숫자를 포함하여 8자 이상 입력해주세요.</small>
          </div>

          <!-- 새 비밀번호 확인 -->
          <div class="form-group">
            <label>새 비밀번호 확인</label>
            <div class="input-wrapper">
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />
              <span class="input-icon">
                <i class="fas fa-lock"></i>
              </span>
            </div>
          </div>

          <button type="submit" class="login-button" :disabled="changePasswordLoading">
            <span v-if="changePasswordLoading" class="spinner"></span>
            <span>{{ changePasswordLoading ? '변경 중...' : '비밀번호 변경' }}</span>
          </button>

          <button type="button" class="back-button" @click="goBackToLogin">
            로그인으로 돌아가기
          </button>
        </form>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- 성공 메시지 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.9rem;
}

.form-container {
  animation: fadeIn 0.3s ease;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
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
  font-size: 0.9rem;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #4a90e2;
}

.input-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.login-button {
  background-color: #4a90e2;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.back-button {
  background-color: transparent;
  color: #666;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.back-button:hover {
  background-color: #f5f5f5;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.find-links {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.find-links a {
  color: #666;
  text-decoration: none;
}

.find-links a:hover {
  text-decoration: underline;
}

.divider-dot {
  color: #666;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  padding: 0 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.social-button.kakao {
  background-color: #FEE500;
  border-color: #FEE500;
  color: #000000;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.social-button.kakao svg {
  margin-right: 0.75rem;
}

.signup-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.signup-link a {
  color: #4a90e2;
  text-decoration: none;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  font-size: 0.9rem;
  text-align: center;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #52c41a;
  font-size: 0.9rem;
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

.found-id-box {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  text-align: center;
}

.found-id-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.found-id-value {
  font-size: 1.2rem;
  font-weight: 500;
  color: #4a90e2;
}

.temp-password-box {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #fff3e0;
  border: 1px solid #ffe0b2;
  border-radius: 4px;
  text-align: center;
}

.temp-password-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.temp-password-value {
  font-size: 1.2rem;
  font-weight: 500;
  color: #f57c00;
  margin-bottom: 0.5rem;
}

.temp-password-info {
  font-size: 0.85rem;
  color: #666;
}

.change-password-box {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #fff3e0;
  border: 1px solid #ffe0b2;
  border-radius: 4px;
  text-align: center;
}

.change-password-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.change-password-info {
  font-size: 0.85rem;
  color: #666;
}

.password-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.register-link {
  background-color: transparent;
  color: #666;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 0.5rem;
  width: 100%;
  text-align: center;
}

.register-link:hover {
  background-color: #f5f5f5;
}
</style>
