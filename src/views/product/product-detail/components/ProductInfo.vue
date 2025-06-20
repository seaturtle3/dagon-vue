<script setup>
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js"
import { ref, computed, onMounted } from 'vue'
import { partnerService } from '@/api/partner'

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
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      currentUser.value = JSON.parse(userInfo);
    }
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
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
  alert('문의 기능은 준비 중입니다!')
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
}

.inquiry-button {
  background-color: white; /* Tailwind: blue-200 */
  padding: 6px 14px; /* 약간 줄여서 중앙 정렬 느낌 맞춤 */
  font-size: 0.9rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.inquiry-button:hover {
  background-color: #93c5fd; /* Tailwind: blue-300 */
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
</style>

