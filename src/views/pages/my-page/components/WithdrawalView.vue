<template>
  <teleport to="body">
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-box" @click.stop>
        <h3>정말 탈퇴하시겠습니까?</h3>
        <p>이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-actions">
          <button class="btn btn-gray" @click="closeModal">취소</button>
          <button class="btn btn-danger" @click="confirmWithdrawal">탈퇴하기</button>
        </div>
      </div>
    </div>
  </teleport>
  <ModalDialog
    :visible="showLoginModal"
    title="로그인 필요"
    message="회원 탈퇴는 로그인 후 이용 가능합니다."
    confirmText="확인"
    :onConfirm="goToLogin"
  />
  <ModalDialog
    :visible="showErrorModal"
    title="오류"
    :message="errorMessage"
    :onConfirm="closeErrorModal"
  />
  <div class="withdrawal-wrapper">
    <h2 class="withdrawal-title">회원 탈퇴</h2>

    <div class="withdrawal-card">
      <div class="warning-section">
        <div class="warning-icon">⚠️</div>
        <h3>회원 탈퇴 전 꼭 확인해주세요</h3>
        <ul>
          <li>탈퇴 시 모든 개인정보가 삭제되며, 복구가 불가능합니다.</li>
          <li>보유하신 포인트는 모두 소멸되며, 환불되지 않습니다.</li>
          <li>작성하신 게시글 및 댓글은 삭제되지 않습니다.</li>
          <li>진행 중인 예약이 있는 경우 탈퇴가 제한될 수 있습니다.</li>
        </ul>
      </div>

      <div class="password-box">
        <label for="password">비밀번호 확인</label>
        <input
            type="password"
            id="password"
            v-model="password"
            placeholder="현재 비밀번호를 입력해주세요"
            class="password-input"
        />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="btn btn-danger full" @click="showConfirmModal" :disabled="!password">
          회원 탈퇴
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { myPageAPI } from '@/api/mypage.js';
import { useAuthStore } from '@/store/login/loginStore.js';
import ModalDialog from '@/components/common/ModalDialog.vue';
import { adminAuth } from '@/api/admin.js';

const router = useRouter();
const authStore = useAuthStore();

const password = ref('');
const errorMessage = ref('');
const isModalOpen = ref(false);
const showLoginModal = ref(false);
const showErrorModal = ref(false);

onMounted(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    showLoginModal.value = true;
  }
});

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

const closeErrorModal = () => {
  showErrorModal.value = false;
  errorMessage.value = '';
};

const confirmWithdrawal = async () => {
  try {
    await myPageAPI.deleteAccount({ password: password.value });
    adminAuth.logout();
    router.push('/login');
  } catch (error) {
    console.error('회원 탈퇴 에러:', error, error.response);
    if (error.response?.status === 400) {
      errorMessage.value = '비밀번호가 일치하지 않습니다.';
    } else {
      errorMessage.value = error.response?.data?.error || '회원 탈퇴 처리 중 오류가 발생했습니다.';
    }
    showErrorModal.value = true;
  } finally {
    isModalOpen.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.withdrawal-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  border: 2px solid #90caf9;
}

.withdrawal-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #0d47a1;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}

.withdrawal-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.warning-section {
  background: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(255, 167, 38, 0.15);
}

.warning-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.warning-section h3 {
  font-size: 1.2rem;
  color: #ef6c00;
  margin-bottom: 1rem;
}

.warning-section ul {
  list-style: disc;
  padding-left: 1.5rem;
  color: #6d4c41;
  font-size: 0.95rem;
}

.password-box label {
  font-weight: 600;
  color: #0d47a1;
  display: block;
  margin-bottom: 0.5rem;
}

.password-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #90caf9;
  font-size: 1rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 0.75rem;
}

.error-message {
  color: #d32f2f;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.full {
  width: 100%;
}

.btn-danger {
  background: #ef5350;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

.btn-gray {
  background: #cfd8dc;
  color: #37474f;
}

.btn-gray:hover {
  background: #b0bec5;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  cursor: default;
}

.modal-box h3 {
  font-size: 1.25rem;
  color: #0d47a1;
  margin-bottom: 1rem;
}

.modal-box p {
  color: #546e7a;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
</style>
