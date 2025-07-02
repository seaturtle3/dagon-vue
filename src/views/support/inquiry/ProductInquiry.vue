<template>
  <div class="inquiry-main">
    <h2>파트너 1:1 문의</h2>
    
    <!-- 비로그인 상태일 때 로그인 안내 -->
    <div v-if="!isLoggedIn" class="login-required-section">
      <div class="login-required-message">
        <h3>로그인이 필요한 서비스입니다</h3>
        <p>파트너 문의를 이용하시려면 먼저 로그인해주세요.</p>
        <div class="button-group">
          <button @click="goToLogin" class="btn-login">로그인</button>
          <button @click="goToRegister" class="btn-register">회원가입</button>
        </div>
      </div>
    </div>
    
    <!-- 로그인 상태일 때만 문의 폼 표시 -->
    <form v-else @submit.prevent="submitInquiry">
      <div class="form-group">
        <label>상품명</label>
        <input v-model="form.productName" type="text" readonly />
      </div>
      
      <!-- 로그인 시 작성자 자동입력 -->
      <div class="form-group">
        <label>작성자</label>
        <input v-model="form.name" type="text" readonly />
      </div>
      
      <!-- 문의 유형 -->
      <div class="form-group">
        <label>문의 유형</label>
        <select v-model="form.inquiryType" required>
          <option value="">문의 유형을 선택하세요.</option>
          <option value="PRODUCT">상품 문의</option>
          <option value="RESERVATION">예약 문의</option>
          <option value="CANCEL">예약 취소 문의</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>제목</label>
        <input v-model="form.title" type="text" required placeholder="제목을 입력하세요" />
      </div>
      <div class="form-group">
        <label>내용</label>
        <textarea v-model="form.content" rows="5" required placeholder="내용을 입력하세요"></textarea>
      </div>
      <button type="submit" class="submit-btn" :disabled="!isFormValid">문의 등록</button>
    </form>
    
    <!-- 문의 등록 성공 모달 -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-window">
        <div class="modal-header">
          <h3>문의 등록 완료</h3>
        </div>
        <div class="modal-body">
          <p class="success-text">문의가 정상 등록되었습니다.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="goToMyInquiries">나의 문의내역</button>
          <button class="btn btn-primary" @click="goToHome">홈으로</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { partnerService } from '@/api/partner';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const form = ref({
  productName: '',
  productId: null,
  partnerUno: null,
  inquiryType: '',
  title: '',
  content: '',
  name: '',
  email: '',
  phone: '',
});

// 로그인 상태 확인
const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token');
  return !!token;
});

// 폼 전체 유효성 검사
const isFormValid = computed(() => {
  return form.value.productName && 
         form.value.inquiryType && 
         form.value.title && 
         form.value.content;
});

const showSuccessModal = ref(false);

onMounted(() => {
  if (route.query.productName) form.value.productName = route.query.productName;
  if (route.query.productId) form.value.productId = Number(route.query.productId);
  if (route.query.partnerUno) form.value.partnerUno = Number(route.query.partnerUno);

  // 로그인 시 작성자 자동입력 (아이디)
  if (isLoggedIn.value) {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        form.value.name = user.uid || user.id || '';
      } catch (e) {
        form.value.name = '';
      }
    }
  }
});

async function submitInquiry() {
  if (!form.value.productName) {
    alert('상품 정보가 없습니다.');
    return;
  }
  if (!form.value.inquiryType) {
    alert('문의 유형을 선택하세요.');
    return;
  }
  
  try {
    const inquiryData = {
      productId: form.value.productId,
      partnerUno: form.value.partnerUno,
      title: `${form.value.productName} 문의 - ${form.value.title}`,
      content: form.value.content,
      inquiryType: form.value.inquiryType,
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      writerType: 'MEMBER'
    };
    
    await partnerService.createPartnerInquiry(inquiryData);
    alert('문의가 등록되었습니다.');
    
    // 폼 초기화
    form.value.title = '';
    form.value.content = '';
    form.value.inquiryType = '';
    showSuccessModal.value = true;
  } catch (e) {
    alert('문의 등록에 실패했습니다.');
  }
}

function goToLogin() {
  router.push('/login');
}

function goToRegister() {
  router.push('/register');
}

function goToMyInquiries() {
  showSuccessModal.value = false;
  router.push('/mypage/inquiries');
}

function goToHome() {
  showSuccessModal.value = false;
  router.push('/');
}
</script>

<style scoped>
.inquiry-main {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem;
}

.login-required-section {
  text-align: center;
  padding: 60px 40px;
}

.login-required-message {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 12px;
  border: 2px solid #e3f2fd;
}

.login-required-message h3 {
  color: #1976d2;
  margin-bottom: 20px;
  font-size: 24px;
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

.form-group {
  margin-bottom: 1.2rem;
}

label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

input, textarea, select {
  width: 100%;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  padding: 10px;
  font-size: 1rem;
  margin-top: 0.2rem;
}

.submit-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #1251a3;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .inquiry-main {
    margin: 20px auto;
    padding: 1.5rem;
  }
  
  .login-required-message {
    padding: 30px 20px;
  }
  
  .login-required-message h3 {
    font-size: 20px;
  }
  
  .button-group {
    flex-direction: column;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-window {
  background: #fff;
  border-radius: 10px;
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  text-align: center;
}
.modal-header h3 {
  margin: 0 0 1rem 0;
  color: #1976d2;
  font-size: 1.3rem;
}
.success-text {
  font-size: 1.1rem;
  color: #28a745;
  font-weight: 600;
  margin: 1.5rem 0;
}
.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 1.5rem;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-primary {
  background-color: #1976d2;
  color: #fff;
}
.btn-primary:hover {
  background-color: #1251a3;
}
.btn-secondary {
  background-color: #6c757d;
  color: #fff;
}
.btn-secondary:hover {
  background-color: #495057;
}
</style> 