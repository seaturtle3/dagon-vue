<template>
  <div class="password-container">
    <h2 class="page-title">비밀번호 변경</h2>
    <div class="password-form">
      <div class="form-group">
        <label>현재 비밀번호</label>
        <input 
          type="password" 
          v-model="passwordForm.currentPassword" 
          class="form-control"
          placeholder="현재 비밀번호를 입력하세요"
        />
      </div>

      <div class="form-group">
        <label>새 비밀번호</label>
        <input 
          type="password" 
          v-model="passwordForm.newPassword" 
          class="form-control"
          placeholder="새 비밀번호를 입력하세요"
          @input="validatePassword"
        />
        <div class="password-rules" v-if="passwordForm.newPassword">
          <p :class="{ 'valid': passwordRules.length }">• 8자 이상</p>
          <p :class="{ 'valid': passwordRules.lowercase }">• 영문자 포함</p>
          <p :class="{ 'valid': passwordRules.number }">• 숫자 포함</p>
        </div>
      </div>

      <div class="form-group">
        <label>새 비밀번호 확인</label>
        <input 
          type="password" 
          v-model="passwordForm.confirmPassword" 
          class="form-control"
          placeholder="새 비밀번호를 다시 입력하세요"
        />
        <div class="password-match" v-if="passwordForm.confirmPassword">
          <p :class="{ 'valid': isPasswordMatch, 'invalid': !isPasswordMatch }">
            {{ isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' }}
          </p>
        </div>
      </div>

      <div class="button-group">
        <button 
          class="btn btn-primary" 
          @click="handleSubmit"
          :disabled="!isFormValid"
        >
          비밀번호 변경
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { myPageAPI } from '@/api/mypage';

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordRules = ref({
  length: false,
  lowercase: false,
  number: false,
  special: false
});

const validatePassword = () => {
  const password = passwordForm.value.newPassword;
  
  passwordRules.value = {
    length: password.length >= 8,
    lowercase: /[a-z]/i.test(password), // 대소문자 구분 없이 영문자 체크
    number: /[0-9]/.test(password)
  };
};

const isPasswordMatch = computed(() => {
  return passwordForm.value.newPassword && 
         passwordForm.value.newPassword === passwordForm.value.confirmPassword;
});

const isFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         isPasswordMatch.value &&
         Object.values(passwordRules.value).every(rule => rule);
});

const handleSubmit = async () => {
  try {
    const response = await myPageAPI.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    });

    if (response.data.message) {
      alert(response.data.message);
      // 폼 초기화
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    alert(error.response?.data?.error || '비밀번호 변경에 실패했습니다.');
  }
};
</script>

<style scoped>
.password-container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #0d47a1;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 1rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #0d47a1;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #90caf9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-control:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
  outline: none;
}

.password-rules {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  color: #546e7a;
  background: rgba(236, 239, 241, 0.6);
  padding: 1rem;
  border-radius: 8px;
}

.password-rules p {
  margin: 0.35rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-rules p::before {
  content: "•";
  color: #90a4ae;
}

.password-match {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
}

.valid {
  color: #00897b;
}

.invalid {
  color: #d32f2f;
}

.button-group {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.btn:disabled {
  background-color: #90caf9;
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: #1976d2;
  color: white;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .password-container {
    padding: 1rem;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 