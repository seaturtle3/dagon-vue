<template>
  <div class="inquiry-main">
    <h2>파트너 1:1 문의</h2>
    <form @submit.prevent="submitInquiry">
      <div class="form-group">
        <label>상품명</label>
        <input v-model="form.productName" type="text" readonly />
      </div>
      
      <!-- 로그인 시 작성자 자동입력 -->
      <div v-if="isLoggedIn" class="form-group">
        <label>작성자</label>
        <input v-model="form.name" type="text" readonly />
      </div>
      
      <!-- 비로그인 상태일 때만 표시되는 문의자 정보 입력 필드 -->
      <div v-if="!isLoggedIn" class="inquirer-info-section">
        <h3>문의자 정보</h3>
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
          <label>작성자</label>
          <input v-model="form.name" type="text" required placeholder="이름을 입력하세요" />
        </div>
        <div class="form-group">
          <label>이메일</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input
              v-model="emailId"
              type="text"
              required
              placeholder="이메일 아이디"
              style="flex: 1;"
            />
            <span>@</span>
            <select v-model="emailDomain" required style="flex: 1;">
              <option value="">도메인 선택</option>
              <option value="gmail.com">gmail.com</option>
              <option value="naver.com">naver.com</option>
              <option value="daum.net">daum.net</option>
              <option value="hanmail.net">hanmail.net</option>
              <option value="nate.com">nate.com</option>
              <option value="직접입력">직접입력</option>
            </select>
            <input
              v-if="emailDomain === '직접입력'"
              v-model="customDomain"
              type="text"
              placeholder="직접입력"
              style="flex: 1;"
            />
          </div>
          <div v-if="fullEmail && !isValidEmail(fullEmail)" style="color:red; font-size:0.9em;">
            올바른 이메일 형식이 아닙니다.
          </div>
        </div>
        <div class="form-group">
          <label>연락처</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <select v-model="phone1" required style="width: 80px;">
              <option value="010">010</option>
              <option value="011">011</option>
              <option value="016">016</option>
              <option value="017">017</option>
              <option value="018">018</option>
              <option value="019">019</option>
              <option value="02">02</option>
              <option value="031">031</option>
              <option value="032">032</option>
              <option value="033">033</option>
              <option value="041">041</option>
              <option value="042">042</option>
              <option value="043">043</option>
              <option value="044">044</option>
              <option value="051">051</option>
              <option value="052">052</option>
              <option value="053">053</option>
              <option value="054">054</option>
              <option value="055">055</option>
              <option value="061">061</option>
              <option value="062">062</option>
              <option value="063">063</option>
              <option value="064">064</option>
            </select>
            <span>-</span>
            <input v-model="phone2" type="text" maxlength="4" required placeholder="직접 입력" style="flex: 1; min-width: 90px;" />
            <span>-</span>
            <input v-model="phone3" type="text" maxlength="4" required placeholder="직접 입력" style="flex: 1; min-width: 90px;" />
          </div>
          <div v-if="form.phone && !isValidPhone(form.phone)" style="color:red; font-size:0.9em;">올바른 연락처 형식이 아닙니다.</div>
        </div>
      </div>
      
      <!-- 로그인 상태일 때만 표시되는 문의 유형 -->
      <div v-if="isLoggedIn" class="form-group">
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
import { ref, onMounted, computed, watch } from 'vue';
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

// 이메일 입력 분리
const emailId = ref('');
const emailDomain = ref('');
const customDomain = ref('');

const fullEmail = computed(() => {
  if (!emailId.value) return '';
  if (emailDomain.value === '직접입력') {
    return customDomain.value ? `${emailId.value}@${customDomain.value}` : '';
  }
  return emailDomain.value ? `${emailId.value}@${emailDomain.value}` : '';
});

watch(fullEmail, (val) => {
  form.value.email = val;
});

// 연락처 입력 분리
const phone1 = ref('010');
const phone2 = ref('');
const phone3 = ref('');

const fullPhone = computed(() => {
  if (!phone1.value || !phone2.value || !phone3.value) return '';
  return `${phone1.value}-${phone2.value}-${phone3.value}`;
});

watch(fullPhone, (val) => {
  form.value.phone = val;
});

// 로그인 상태 확인
const isLoggedIn = computed(() => {
  const token = localStorage.getItem('token');
  return !!token;
});

// 이메일/연락처 유효성 검사 함수
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone);

// 폼 전체 유효성 검사
const isFormValid = computed(() => {
  if (!form.value.productName || !form.value.inquiryType || !form.value.title || !form.value.content) return false;
  if (isLoggedIn.value) return true;
  return (
    form.value.name &&
    isValidEmail(form.value.email) &&
    isValidPhone(form.value.phone)
  );
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
  
  // 비로그인 상태에서 필수 필드 검증
  if (!isLoggedIn.value) {
    if (!form.value.name || !form.value.email || !form.value.phone) {
      alert('문의자 정보를 모두 입력해주세요.');
      return;
    }
    if (!isValidEmail(form.value.email)) {
      alert('이메일 형식이 올바르지 않습니다.');
      return;
    }
    if (!isValidPhone(form.value.phone)) {
      alert('연락처 형식이 올바르지 않습니다.');
      return;
    }
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
      writerType: 'NON_MEMBER'
    };
    
    await partnerService.createPartnerInquiry(inquiryData);
    alert('문의가 등록되었습니다.');
    
    // 폼 초기화
    form.value.title = '';
    form.value.content = '';
    form.value.inquiryType = '';
    if (!isLoggedIn.value) {
      form.value.name = '';
      emailId.value = '';
      emailDomain.value = '';
      customDomain.value = '';
      phone1.value = '010';
      phone2.value = '';
      phone3.value = '';
    }
    showSuccessModal.value = true;
  } catch (e) {
    alert('문의 등록에 실패했습니다.');
  }
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

.inquirer-info-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #28a745;
}

.inquirer-info-section h3 {
  margin: 0 0 15px 0;
  color: #28a745;
  font-size: 18px;
  font-weight: 600;
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