<template>
  <div class="inquiry-main">
    <h2>파트너 1:1 문의</h2>
    <form @submit.prevent="submitInquiry">
      <div class="form-group">
        <label>상품명</label>
        <input v-model="form.productName" type="text" readonly />
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
          <input v-model="form.email" type="email" required placeholder="이메일을 입력하세요" />
        </div>
        <div class="form-group">
          <label>연락처</label>
          <input v-model="form.phone" type="tel" required placeholder="연락처를 입력하세요" />
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
        <input v-model="form.title" type="text" required />
      </div>
      <div class="form-group">
        <label>내용</label>
        <textarea v-model="form.content" rows="5" required></textarea>
      </div>
      <button type="submit" class="submit-btn">문의 등록</button>
    </form>
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

onMounted(() => {
  if (route.query.productName) form.value.productName = route.query.productName;
  if (route.query.productId) form.value.productId = Number(route.query.productId);
  if (route.query.partnerUno) form.value.partnerUno = Number(route.query.partnerUno);
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
  }
  
  try {
    const inquiryData = {
      productId: form.value.productId,
      partnerUno: form.value.partnerUno,
      title: `${form.value.productName} 문의 - ${form.value.title}`,
      content: form.value.content,
      inquiryType: form.value.inquiryType
    };
    
    // 비로그인 상태일 때 추가 정보 포함
    if (!isLoggedIn.value) {
      inquiryData.name = form.value.name;
      inquiryData.email = form.value.email;
      inquiryData.phone = form.value.phone;
      inquiryData.writerType = 'NON_MEMBER';
    }
    
    await partnerService.createPartnerInquiry(inquiryData);
    alert('문의가 등록되었습니다.');
    
    // 폼 초기화
    form.value.title = '';
    form.value.content = '';
    form.value.inquiryType = '';
    if (!isLoggedIn.value) {
      form.value.name = '';
      form.value.email = '';
      form.value.phone = '';
    }
    
    router.push('/partner/inquiries');
  } catch (e) {
    alert('문의 등록에 실패했습니다.');
  }
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
</style> 