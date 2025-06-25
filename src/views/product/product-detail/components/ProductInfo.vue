<script setup>
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js"
import { ref, computed, onMounted } from 'vue'
import { partnerService } from '@/api/partner'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  product: {
    type: Object,
    required: true,
  }
})

// 신고 관련 상태
const showReportForm = ref(false)
const reportReason = ref('')

// 현재 사용자 정보
const currentUser = ref(null);

// 현재 사용자가 상품 작성자인지 확인
const isOwnProduct = computed(() => {
  if (!currentUser.value || !props.product.user) return false;
  return currentUser.value.uid === props.product.user.uid;
});

// 사용자 정보 초기화
const initializeUserInfo = () => {
  try {
    // 1. localStorage에서 사용자 정보 확인
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      currentUser.value = JSON.parse(userInfo);
      console.log('localStorage에서 사용자 정보 로드:', currentUser.value);
    }
    
    // 2. 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('토큰이 없음 - 비로그인 상태');
      currentUser.value = null;
    } else {
      console.log('토큰 존재 - 로그인 상태');
    }
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
    currentUser.value = null;
  }
};

// console.log('ProductInfo props product:', props.product)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function onContactClick() {
  console.log('1:1 문의 버튼 클릭됨');
  console.log('상품 정보:', props.product);
  console.log('현재 사용자 정보:', currentUser.value);
  
  // 로그인 상태 확인 (토큰과 사용자 정보 모두 확인)
  const token = localStorage.getItem('token');
  const isLoggedIn = token && currentUser.value && currentUser.value.uid;
  
  console.log('토큰 존재:', !!token);
  console.log('사용자 정보 존재:', !!currentUser.value);
  console.log('로그인 상태:', isLoggedIn);
  
  if (isLoggedIn) {
    console.log('로그인된 사용자 - MemberInquiry로 이동');
    // 로그인된 사용자는 MemberInquiry 페이지로 이동
    router.push({
      name: 'MemberInquiry',
      query: {
        productId: props.product.prodId,
        productName: props.product.prodName,
        productType: 'product'
      }
    });
  } else {
    console.log('비로그인 사용자 - GuestInquiry로 이동');
    // 비로그인 사용자는 GuestInquiry 페이지로 이동
    router.push({
      name: 'GuestInquiry',
      query: {
        productId: props.product.prodId,
        productName: props.product.prodName,
        productType: 'product'
      }
    });
  }
}

// 신고 폼 열기
function openReportForm() {
  // 자기 자신 신고 방지
  if (isOwnProduct.value) {
    alert('자기 자신의 상품은 신고할 수 없습니다.');
    return;
  }

  // 이미 신고한 상품인지 확인
  const reportedItems = JSON.parse(localStorage.getItem('reportedItems') || '[]');
  if (reportedItems.some(item => item.id === props.product.prodId && item.type === 'product')) {
    alert('이미 신고한 상품입니다.');
    return;
  }

  // prodId가 null이면 URL에서 ID 추출
  if (!props.product.prodId) {
    const currentPath = window.location.pathname;
    const pathMatch = currentPath.match(/\/products\/(\d+)/);
    if (pathMatch) {
      const pathId = pathMatch[1];
      props.product.prodId = parseInt(pathId);
    }
  }
  
  // 가능한 ID 필드들 확인
  const possibleIdFields = ['prodId', 'id', 'productId', 'product_id'];
  const foundId = possibleIdFields.find(field => props.product[field] && props.product[field] !== null && props.product[field] !== undefined);
  
  if (!foundId) {
    alert('상품 ID를 찾을 수 없습니다. 상품 데이터를 확인해주세요.');
    return;
  }
  
  showReportForm.value = true;
}

// 신고 폼 닫기
function closeReportForm() {
  showReportForm.value = false
  reportReason.value = ''
}

// 신고 제출
async function submitReport() {
  if (!reportReason.value.trim()) {
    alert('신고 사유를 입력해주세요.')
    return
  }

  if (!props.product.prodId) {
    alert('상품 ID가 없습니다. 페이지를 새로고침해주세요.')
    return
  }

  if (!confirm('이 상품을 신고하시겠습니까?')) {
    return
  }

  try {
    await partnerService.reportProduct(props.product.prodId, reportReason.value)
    // 신고 성공 시 localStorage에 저장
    const reportedItems = JSON.parse(localStorage.getItem('reportedItems') || '[]');
    reportedItems.push({ id: props.product.prodId, type: 'product' });
    localStorage.setItem('reportedItems', JSON.stringify(reportedItems));
    
    alert('상품이 성공적으로 신고되었습니다.')
    closeReportForm()
  } catch (error) {
    console.error('상품 신고 실패:', error)
    console.error('에러 응답:', error.response?.data)
    console.error('에러 상태:', error.response?.status)
    console.error('에러 헤더:', error.response?.headers)
    console.error('요청 데이터:', {
      prodId: props.product.prodId,
      reason: reportReason.value
    })
    
    // 백엔드에서 보내는 에러 메시지 표시
    const errorMessage = error.response?.data?.message || '상품 신고에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  }
}

// 컴포넌트 마운트 시 사용자 정보 초기화
onMounted(() => {
  initializeUserInfo();
});
</script>

<template>
  <div>
    <div class="mb-5" style="text-align: center">
      <h2>배 상품 상세페이지</h2>
    </div>

    <div class="info-container">
      <!-- 썸네일 영역 -->
      <div class="thumbnail-wrapper">
        <img
            :src="`${IMAGE_BASE_URL}/${props.product.prodThumbnail}`"
            class="thumbnail"
            alt="썸네일"
        />
      </div>

      <!-- 텍스트 정보 영역 -->
      <div class="info-text">
        <div class="title-row">
          <h1 class="title">{{ props.product.prodName }}</h1>
          <div class="button-group">
            <button @click="onContactClick" class="inquiry-button">1:1 문의</button>
            <button @click="openReportForm" class="report-button">
              <i class="fas fa-flag"></i> 신고
            </button>
          </div>
        </div>

        <p>지역: {{ props.product.prodRegionKorean }}</p>
        <p>장소: {{ props.product.mainTypeKorean }}</p>
        <p>세부 장소: {{ props.product.subTypeKorean }}</p>
        <p>최대인원: {{ props.product.maxPerson }}</p>
        <p>최소인원: {{ props.product.minPerson }}</p>
        <p>배 무게: {{ props.product.weight }}</p>
        <p>배 주소: {{ props.product.prodAddress }}</p>
        <p>배 정보: {{ props.product.prodDescription }}</p>
        <p>등록일: {{ formatDate(props.product.createdAt) }}</p>
      </div>
    </div>

    <!-- 옵션 정보 표 -->
    <div v-if="props.product.options && props.product.options.length" class="option-table-section">
      <h3>상품 옵션 정보</h3>
      <table class="option-table">
        <thead>
          <tr>
            <th>옵션명</th>
            <th>옵션 설명</th>
            <th>가격</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="option in props.product.options" :key="option.option_id">
            <td>{{ option.optName || option.option_name }}</td>
            <td>{{ option.optDescription || option.option_description }}</td>
            <td>{{ option.price ? option.price.toLocaleString() + '원' : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 신고 모달 -->
    <div v-if="showReportForm" class="report-overlay">
      <div class="report-modal">
        <h3>{{ props.product.prodName }} 신고</h3>
        <form @submit.prevent="submitReport">
          <div class="form-group">
            <label for="reportReason">신고 사유</label>
            <textarea
              id="reportReason"
              v-model="reportReason"
              required
              placeholder="신고 사유를 입력해주세요"
              rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">신고하기</button>
            <button type="button" class="cancel-button" @click="closeReportForm">취소</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  width: 100%; /* 전체 폭 차지 */
}

.thumbnail-wrapper {
  flex: 0 0 60%;
  display: flex;
}

.thumbnail {
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  height: 400px; /* 고정 높이 */
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-left: 30px; /* 썸네일과 간격 */
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0; /* 기본 h1 마진 제거 */
  line-height: 1.2; /* 글자 위아래 높이 안정화 */
}

/* 🔥 타이틀과 버튼을 수평 정렬 */
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}

.button-group {
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;
  z-index: 10;
}

.inquiry-button {
  background-color: white;
  padding: 6px 14px;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  border: 1px solid #ccc;
  cursor: pointer;
  color: #333;
}

.inquiry-button:hover {
  background-color: #93c5fd;
}

.report-button {
  background-color: #dc3545; /* 빨간색 */
  color: white;
  padding: 6px 14px;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.report-button:hover {
  background-color: #c82333;
}

.report-button i {
  margin-right: 4px;
}

/* 신고 모달 스타일 */
.report-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.report-modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.report-modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #1a237e;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
}

.form-group textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-button,
.cancel-button {
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button {
  background-color: #dc3545;
  color: white;
}

.submit-button:hover {
  background-color: #c82333;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.option-table-section {
  margin-top: 32px;
}
.option-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  background: #f8f9fa;
}
.option-table th, .option-table td {
  border: 1px solid #e0e0e0;
  padding: 10px 12px;
  text-align: center;
}
.option-table th {
  background: #e3eafc;
  color: #1a237e;
  font-weight: 600;
}
.option-table-section h3 {
  text-align: center;
}
</style>

