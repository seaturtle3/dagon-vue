<template>
  <div class="inquiry-container">
    <h2 class="page-title">1:1 문의(회원전용)</h2>

    <!-- 상품 정보 표시 섹션 -->
    <div v-if="productInfo" class="product-info-section">
      <h3>상품 정보</h3>
      <div class="product-info">
        <p><strong>상품명:</strong> {{ productInfo.productName }}</p>
        <p><strong>상품ID:</strong> {{ productInfo.productId }}</p>
      </div>
    </div>

    <!-- 항상 보이는 문의하기 작성 폼 -->
    <div class="inquiry-form">
      <h3>문의하기 작성</h3>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>아이디</label>
          <input type="text" :value="userInfo.uid" readonly class="readonly-input">
        </div>
        <div class="form-group">
          <label>작성자 유형</label>
          <input type="text" :value="userInfo.role === 'PARTNER' ? '파트너' : '일반회원'" readonly class="readonly-input">
        </div>
        <div class="form-group">
          <label>문의 유형</label>
          <select v-model="form.inquiryType" required>
            <option value="">문의 유형을 선택하세요.</option>
            <option value="PRODUCT">상품 문의</option>
            <option value="BUSINESS">제휴 문의</option>
            <option value="SYSTEM">시스템 문의</option>
            <option value="RESERVATION">예약 문의</option>
            <option value="CANCEL">예약 취소 문의</option>
          </select>
        </div>
        <div class="form-group">
          <label>제목</label>
          <input type="text" v-model="form.title" required>
        </div>
        <div class="form-group">
          <label>내용</label>
          <textarea v-model="form.content" required placeholder="문의 내용을 입력해주세요."></textarea>
        </div>
        <div class="form-actions">
          <button type="submit">등록</button>
          <button type="button" @click="resetForm">초기화</button>
        </div>
        </form>
      <div class="inquiry-container">
        <!-- 기존 코드 생략 -->

        <!-- 문의 등록 모달 -->
        <MemberInquiryModal
            v-if="showModal"
            :inquiry="submittedData"
            @close="closeModal"
            @reset-form="resetForm"
        />
      </div>
    </div>

    <!-- 로그인 안내 모달 -->
    <div v-if="showLoginModal" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>로그인 필요</h2>
        </div>
        <div class="modal-body">
          <p>문의 작성은 로그인 후 이용 가능합니다.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="goToLogin">로그인 페이지로 이동</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInquiryStore } from '@/store/inquiries/inquiryStore';
import { useAuthStore } from '@/store/login/loginStore';
import { myPageAPI } from '@/api/mypage.js';
import { inquiryApi } from '@/api/inquiry.js';
import MemberInquiryModal from './MemberInquiryModal.vue';

const route = useRoute();
const router = useRouter();
const store = useInquiryStore();
const authStore = useAuthStore();

const userInfo = ref({
  uid: '',
  role: '',
  uno: null
});

const form = ref({
  title: '',
  content: '',
  inquiryType: '',
  writerType: '',
  receiverId: null
});

const showLoginModal = ref(false)
const productInfo = ref(null)

const inquiryTypes = {
  USER: [
    { value: 'PRODUCT', label: '상품 문의' },
    { value: 'RESERVATION', label: '예약 문의' },
    { value: 'RESERVATION_CANCEL', label: '예약 취소 문의' }
  ],
  PARTNER: [
    { value: 'PRODUCT', label: '상품 문의' },
    { value: 'RESERVATION', label: '예약 문의' },
    { value: 'RESERVATION_CANCEL', label: '예약 취소 문의' }
  ]
};

const availableInquiryTypes = computed(() => {
  return inquiryTypes[userInfo.value.role] || [];
});

const initializeProductInfo = () => {
  // URL 쿼리 파라미터에서 상품 정보 가져오기
  if (route.query.productId && route.query.productName) {
    productInfo.value = {
      productId: route.query.productId,
      productName: route.query.productName,
      productType: route.query.productType || 'product'
    };
    
    console.log('상품 정보 받음:', productInfo.value);
    
    // 상품 문의인 경우 자동으로 문의 유형만 설정
    if (productInfo.value.productType === 'product') {
      form.value.inquiryType = 'PRODUCT';
      // 제목은 자동 설정하지 않고 회원이 직접 입력하도록 함
    }
  }
};

const fetchUserInfo = async () => {
  try {
    console.log('사용자 정보 조회 시작...');
    const response = await myPageAPI.getMyInfo();
    console.log('사용자 정보 응답:', response.data);
    
    userInfo.value = {
      uid: response.data.uid,
      role: response.data.role,
      uno: response.data.uno
    };
    form.value.writerType = response.data.role;
    
    console.log('설정된 사용자 정보:', userInfo.value);
    
    // 로그인 정보가 없으면 모달 표시
    if (!userInfo.value.uid) {
      console.warn('사용자 ID가 없습니다. 로그인 모달을 표시합니다.');
      showLoginModal.value = true;
    }
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    console.error('에러 응답:', error.response?.data);
    showLoginModal.value = true;
  }
};

const showModal = ref(false);
const submittedData = ref(null); // 작성된 문의 데이터

const openModal = (data) => {
  submittedData.value = data;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  submittedData.value = null;
};

const submitForm = async () => {
  if (!form.value.inquiryType || !form.value.title || !form.value.content) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  // writerId가 제대로 설정되었는지 확인
  if (!userInfo.value.uno) {
    console.error('사용자 ID가 없습니다:', userInfo.value);
    alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
    return;
  }

  // 상품 정보가 있으면 문의 내용에 추가
  let content = form.value.content;
  if (productInfo.value) {
    content = `상품 정보:\n- 상품명: ${productInfo.value.productName}\n- 상품ID: ${productInfo.value.productId}\n\n문의 내용:\n${content}`;
  }

  const inquiryData = {
    ...form.value,
    content: content,
    writerId: userInfo.value.uno,
    writerType: userInfo.value.role,
    status: '대기중',
    createdAt: new Date().toISOString(),
    userName: userInfo.value.uid
  };

  console.log('문의 데이터 준비:', inquiryData);
  console.log('사용자 정보:', userInfo.value);

  try {
    // 실제 API 호출
    await inquiryApi.createInquiry(inquiryData);
    alert('문의가 정상 등록되었습니다.');
    
    // Inquiries.vue로 데이터 전달을 위해 store에 저장
    store.addNewInquiry({
      id: Date.now(), // 임시 ID 생성
      title: inquiryData.title,
      content: inquiryData.content,
      status: '대기중',
      createdAt: inquiryData.createdAt,
      userName: inquiryData.userName,
      author: inquiryData.userName,
      inquiryType: inquiryData.inquiryType,
      answerContent: null,
      answeredAt: null
    });
    
    resetForm();
    
    // 관리자 문의 페이지로 이동 (해당 문의 유형 탭 선택)
    router.push({
      path: '/admin/inquiries',
      query: { type: inquiryData.inquiryType }
    });
  } catch (error) {
    console.error('문의 저장 실패:', error);
    alert('저장에 실패했습니다.');
  }
};

const resetForm = () => {
  form.value = {
    title: '',
    content: '',
    inquiryType: productInfo.value ? 'PRODUCT' : '',
    writerType: userInfo.value.role,
    receiverId: null
  };
};

const goToLogin = () => {
  router.push('/login')
}

onMounted(async () => {
  // 로그인 상태 확인
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');
  
  if (!token || !userInfo) {
    console.log('비로그인 사용자가 MemberInquiry에 접근 - GuestInquiry로 리다이렉트');
    alert('로그인이 필요한 서비스입니다.');
    router.push({
      name: 'GuestInquiry',
      query: route.query
    });
    return;
  }
  
  await fetchUserInfo();
  initializeProductInfo();
});

</script>

<style scoped>
.inquiry-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
}

.inquiry-table th,
.inquiry-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.inquiry-table th {
  background-color: #f5f5f5;
}

.inquiry-table tbody tr:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}

.readonly-input {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
}

.form-group select option[value=""] {
  color: #aaa;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.pagination button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.inquiry-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-info-section {
  background: #e8f4fd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #007BFF;
}

.product-info-section h3 {
  margin: 0 0 15px 0;
  color: #007BFF;
  font-size: 18px;
  font-weight: 600;
}

.product-info p {
  margin: 8px 0;
  color: #333;
  font-size: 14px;
}

.product-info strong {
  color: #007BFF;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 200px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
}

button[type="button"] {
  background-color: #666;
}

button:hover {
  opacity: 0.9;
}

.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-group select option[value=""] {
  color: #999;
}

.form-group select option:not([value=""]) {
  color: #333;
}
</style> 