<script setup>
import MemberInquiry from '@/views/support/inquiry/components/MemberInquiry.vue';
import { useAuthStore } from '@/store/login/loginStore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// 앱 진입 후 상태 복구가 필요한 경우
authStore.checkAuth()
const { isAuthenticated } = authStore

// 로그인 안내 모달 상태
const showLoginModal = ref(false)

// 비로그인 시 로그인 안내 모달 표시
const handleNonMemberAccess = () => {
  showLoginModal.value = true
}

// 로그인 페이지로 이동
const goToLogin = () => {
  showLoginModal.value = false
  router.push('/login')
}

// 회원가입 페이지로 이동
const goToRegister = () => {
  showLoginModal.value = false
  router.push('/register')
}

// 모달 닫기
const closeModal = () => {
  showLoginModal.value = false
}

console.log('isAuthenticated:', isAuthenticated)
</script>

<template>
  <div>
    <MemberInquiry v-if="isAuthenticated" />
    <div v-else class="non-member-container">
      <div class="login-required-message">
        <h2>로그인이 필요한 서비스입니다</h2>
        <p>1:1 문의를 이용하시려면 먼저 로그인해주세요.</p>
        <div class="button-group">
          <button @click="goToLogin" class="btn-login">로그인</button>
          <button @click="goToRegister" class="btn-register">회원가입</button>
        </div>
      </div>
    </div>

    <!-- 로그인 안내 모달 -->
    <div v-if="showLoginModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>로그인 필요</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>1:1 문의를 이용하시려면 먼저 로그인해주세요.</p>
        </div>
        <div class="modal-footer">
          <button @click="goToLogin" class="btn-login">로그인</button>
          <button @click="goToRegister" class="btn-register">회원가입</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.non-member-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.login-required-message {
  background: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #e3f2fd;
}

.login-required-message h2 {
  color: #1976d2;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 600;
}

.login-required-message p {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.6;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-login, .btn-register {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login {
  background: #1976d2;
  color: white;
}

.btn-login:hover {
  background: #1565c0;
  transform: translateY(-2px);
}

.btn-register {
  background: #4caf50;
  color: white;
}

.btn-register:hover {
  background: #388e3c;
  transform: translateY(-2px);
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 25px;
}

.modal-body p {
  margin: 0;
  color: #666;
  font-size: 16px;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid #eee;
}

.modal-footer .btn-login,
.modal-footer .btn-register {
  flex: 1;
  padding: 10px 20px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .login-required-message {
    padding: 40px 20px;
  }
  
  .login-required-message h2 {
    font-size: 24px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
