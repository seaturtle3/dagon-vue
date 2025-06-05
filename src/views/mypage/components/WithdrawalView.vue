<template>
  <div class="withdrawal-container">
    <h2 class="page-title">회원 탈퇴</h2>
    
    <div class="withdrawal-content">
      <div class="warning-box">
        <div class="warning-icon">⚠️</div>
        <h3>회원 탈퇴 전 꼭 확인해주세요!</h3>
        <ul>
          <li>탈퇴 시 모든 개인정보가 삭제되며, 복구가 불가능합니다.</li>
          <li>보유하신 포인트는 모두 소멸되며, 환불되지 않습니다.</li>
          <li>작성하신 게시글 및 댓글은 삭제되지 않습니다.</li>
          <li>진행 중인 예약이 있는 경우 탈퇴가 제한될 수 있습니다.</li>
        </ul>
      </div>

      <div class="password-section">
        <div class="form-group">
          <label for="password">비밀번호 확인</label>
          <input 
            type="password" 
            id="password" 
            v-model="password"
            placeholder="현재 비밀번호를 입력해주세요"
            class="password-input"
          />
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>

      <div class="button-group">
        <button 
          class="btn btn-danger" 
          @click="showConfirmModal"
          :disabled="!password"
        >
          회원 탈퇴
        </button>
      </div>

      <!-- 최종 확인 모달 -->
      <div class="modal" v-if="isModalOpen">
        <div class="modal-content">
          <h3>정말 탈퇴하시겠습니까?</h3>
          <p>이 작업은 취소할 수 없습니다.</p>
          <div class="modal-buttons">
            <button class="btn btn-secondary" @click="closeModal">취소</button>
            <button class="btn btn-danger" @click="confirmWithdrawal">탈퇴하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { myPageAPI } from '@/api/mypage';
import { useAuthStore } from '@/store/login/loginStore';

const router = useRouter();
const authStore = useAuthStore();

const password = ref('');
const errorMessage = ref('');
const isModalOpen = ref(false);

const showConfirmModal = () => {
  if (!password.value) {
    errorMessage.value = '비밀번호를 입력해주세요.';
    return;
  }
  errorMessage.value = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const confirmWithdrawal = async () => {
  try {
    const response = await myPageAPI.deleteAccount(password.value);
    if (response.data.message) {
      await authStore.logout();
      router.push('/');
    }
  } catch (error) {
    if (error.response?.data?.error) {
      errorMessage.value = error.response.data.error;
    } else {
      errorMessage.value = '회원 탈퇴 처리 중 오류가 발생했습니다.';
    }
  } finally {
    closeModal();
  }
};
</script>

<style scoped>
.withdrawal-container {
  max-width: 800px;
  padding: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.withdrawal-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.warning-box {
  background: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 2rem;
}

.warning-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.warning-box h3 {
  color: #d32f2f;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.warning-box ul {
  list-style-type: none;
  padding: 0;
}

.warning-box li {
  color: #555;
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.warning-box li::before {
  content: "•";
  color: #d32f2f;
  position: absolute;
  left: 0;
}

.password-section {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.password-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
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
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  margin-right: 1rem;
}

.btn-secondary:hover {
  background: #5a6268;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 1rem;
  color: #333;
}

.modal-content p {
  margin-bottom: 1.5rem;
  color: #666;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .withdrawal-container {
    padding: 1rem;
  }

  .warning-box, .password-section {
    padding: 1.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>