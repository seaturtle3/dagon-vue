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
          <p :class="{ 'valid': passwordRules.special }">• 특수문자 포함</p>
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
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
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
  padding: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #1a73e8;
  outline: none;
}

.password-rules {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.password-rules p {
  margin: 0.25rem 0;
}

.password-match {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.valid {
  color: #28a745;
}

.invalid {
  color: #dc3545;
}

.button-group {
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-primary {
  background: #1a73e8;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1557b0;
}
</style> 