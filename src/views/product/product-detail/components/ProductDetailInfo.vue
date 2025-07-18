<script setup>
import { ref, computed, onMounted } from 'vue'
import { partnerService } from '@/api/partner'
import {BASE_URL} from "@/constants/baseUrl.js";
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useRouter } from 'vue-router'
import { convertToRelativeUrl } from '@/utils/authUtils.js'

import ProductEditButton from "@/views/product/product-detail/components/ProductEditButton.vue";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  }
})

const router = useRouter()

// 신고 관련 상태
const showReportForm = ref(false)
const reportReason = ref('')

// 현재 사용자 정보
const currentUser = ref(null);

// 현재 사용자가 상품 작성자인지 확인
const isOwnProduct = ref(false);

// 이미지 모달 관련 상태
const showImageModal = ref(false)
const modalStartIndex = ref(0)

const imageList = computed(() => {
  if (props.product.prodImageDataList && props.product.prodImageDataList.length > 0) {
    return props.product.prodImageDataList.map(img =>
      img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`
    )
  } else if (props.product.prodImageNames && props.product.prodImageNames.length > 0) {
    return props.product.prodImageNames.map(img => convertToRelativeUrl(img))
  }
  return []
})

const swiperInstance = ref(null)
let timer = null
const isReady = ref(false)

function onSwiperReady(swiper) {
  swiperInstance.value = swiper
  isReady.value = true;
  console.log('Swiper 인스턴스 설정됨:', swiper)
}

function onMouseEnter() {
  timer = setTimeout(() => {
    if (isReady.value && swiperInstance.value?.slideNext) {
      swiperInstance.value.slideNext();
    } else if (isReady.value && swiperInstance.value?.swiper?.slideNext) {
      swiperInstance.value.swiper.slideNext();
    } else {
      console.log('Swiper 인스턴스가 아직 준비되지 않았습니다.', swiperInstance.value);
    }
  }, 2000);
}

function onMouseLeave() {
  clearTimeout(timer);
}

// 파트너 상품 목록에서 본인 상품인지 확인
const checkOwnership = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      isOwnProduct.value = false;
      return;
    }

    // 파트너 상품 목록 조회
    const response = await partnerService.getPartnerProducts();
    const myProducts = response.data;
    
    // 현재 상품이 내 상품 목록에 있는지 확인
    isOwnProduct.value = myProducts.some(product => product.prodId === props.product.prodId);
    
    console.log('=== 본인 상품 확인 디버깅 ===');
    console.log('내 상품 목록:', myProducts.map(p => p.prodId));
    console.log('현재 상품 ID:', props.product.prodId);
    console.log('본인 상품 여부:', isOwnProduct.value);
    console.log('========================');
    
  } catch (error) {
    console.error('상품 소유권 확인 실패:', error);
    isOwnProduct.value = false;
  }
};

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

function onContactClick() {
  router.push({
    path: '/product-inquiry',
    query: {
      productName: props.product.prodName,
      productId: props.product.prodId,
      partnerUno: props.product.uno
    }
  });
}

// 신고 폼 열기
function openReportForm() {
  // 자기 자신 신고 방지 (uno로 확인)
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userUno = payload.uno;
      
      if (userUno === props.product.uno) {
        alert('자기 자신의 상품은 신고할 수 없습니다.');
        return;
      }
    } catch (e) {
      console.error('토큰에서 uno 추출 실패:', e);
    }
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

// 상품 삭제 함수
async function deleteProduct() {
  if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
    return
  }

  try {
    await partnerService.deleteProduct(props.product.prodId)
    alert('상품이 성공적으로 삭제되었습니다.')
    router.push('/')
  } catch (error) {
    console.error('상품 삭제 실패:', error)
    const errorMessage = error.response?.data?.message || '상품 삭제에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  }
}

// 이미지 클릭 시 모달 오픈
function openImageModal(idx) {
  modalStartIndex.value = idx
  showImageModal.value = true
}
function closeImageModal() {
  showImageModal.value = false
}

// 컴포넌트 마운트 시 사용자 정보 초기화
onMounted(() => {
  initializeUserInfo();
  checkOwnership();
});

console.log('swiperInstance.value:', swiperInstance.value);
console.log('swiperInstance.value.swiper:', swiperInstance.value?.swiper);
</script>

<template>
  <div class="product-detail-container">
    <!-- 페이지 헤더 -->
    <div class="page-header">

      <!-- 작성자인 경우에만 수정/삭제 버튼 표시 -->
      <div class="header-actions" style="display: flex; justify-content: flex-end">
        <ProductEditButton :product="product" v-if="isOwnProduct" />

        <button v-if="isOwnProduct" @click="deleteProduct" class="btn btn-danger">
          <i class="fa-solid fa-x"></i>
          삭제
        </button>
      </div>

      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">{{ props.product.prodName }}</h1>
          <div class="breadcrumb">
            <span>홈</span>
            <span class="separator">></span>
            <span>상품</span>
            <span class="separator">></span>
            <span>{{ props.product.prodName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 상품 정보 -->
    <div class="product-main-info">
      <!-- 썸네일 영역 -->
      <div class="thumbnail-section">
        <div class="thumbnail-container">
          <Swiper
              ref="swiperInstance"
              :modules="[Navigation, Pagination, Autoplay]"
              :slides-per-view="1"
              :space-between="10"
              :loop="true"
              :autoplay="{ delay: 2500, disableOnInteraction: false }"
              navigation
              pagination
              class="main-swiper"
              @swiper="onSwiperReady"
              @mouseenter="onMouseEnter"
              @mouseleave="onMouseLeave"
          >
            <!-- 1. prodImageDataList가 있으면 그것만 보여줌 -->
            <template v-if="props.product.prodImageDataList && props.product.prodImageDataList.length > 0">
              <SwiperSlide
                v-for="(imgData, idx) in props.product.prodImageDataList"
                :key="'data-'+idx"
                @click="openImageModal(idx)"
                style="cursor: pointer"
              >
                <img :src="imgData.startsWith('data:image') ? imgData : `data:image/jpeg;base64,${imgData}`" class="slide-image" alt="상품 이미지" />
              </SwiperSlide>
            </template>
            <!-- 2. prodImageNames가 있으면 그것만 보여줌 -->
            <template v-else-if="props.product.prodImageNames && props.product.prodImageNames.length > 0">
              <SwiperSlide
                v-for="(img, idx) in props.product.prodImageNames"
                :key="'name-'+idx"
                @click="openImageModal(idx)"
                style="cursor: pointer"
              >
                <img :src="img.startsWith('/') ? img : `${BASE_URL}${img}`" class="slide-image" alt="상품 이미지" />
              </SwiperSlide>
            </template>
            <!-- 3. 둘 다 없으면 placeholder -->
            <template v-else>
              <SwiperSlide>
                <div class="no-image-placeholder">
                  이미지 없음
                </div>
              </SwiperSlide>
            </template>
          </Swiper>

          <div class="thumbnail-overlay">
            <div class="zoom-icon">
              <i class="fas fa-search-plus"></i>
            </div>
          </div>
        </div>

      </div>

      <!-- 상품 기본 정보 -->
      <div class="product-info-section">
        <div class="product-header">
<!--          <h2 class="product-title">{{ props.product.prodName }}</h2>-->
          <div class="action-buttons">
            <button @click="onContactClick" class="btn btn-primary">
              <i class="fas fa-comments"></i>
              1:1 문의
            </button>
            <button @click="openReportForm" class="btn btn-danger">
              <i class="fas fa-flag"></i>
              신고
            </button>
          </div>
        </div>

        <div class="product-details">
          <div class="detail-item">
            <div class="detail-label">
              <i class="fas fa-map-marker-alt"></i>
              지역
            </div>
            <div class="detail-value">{{ props.product.prodRegionKorean }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <i class="fas fa-anchor"></i>
              장소
            </div>
            <div class="detail-value">{{ props.product.mainTypeKorean }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <i class="fas fa-map-pin"></i>
              세부 장소
            </div>
            <div class="detail-value">{{ props.product.subTypeKorean }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <i class="fas fa-users"></i>
              최대 인원
            </div>
            <div class="detail-value">{{ props.product.maxPerson }}명</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <i class="fas fa-users"></i>
              최소 인원
            </div>
            <div class="detail-value">{{ props.product.minPerson }}명</div>
          </div>

        </div>
      </div>
    </div>

    <!-- 배 정보 박스 -->
    <div class="boat-info-box">
      <div class="boat-info-header">
        <h3 class="boat-info-title">
          <i class="fas fa-ship"></i>
          배 정보
        </h3>
      </div>
      <div class="boat-info-content">
        <div class="boat-detail-grid">
          <div class="boat-detail-item">
            <div class="boat-detail-label">
              선박 무게
            </div>
            <div class="boat-detail-value">{{ props.product.weight }} t</div>
          </div>

          <div class="boat-detail-item">
            <div class="boat-detail-label">
              선박 주소
            </div>
            <div class="boat-detail-value">{{ props.product.prodAddress }}</div>
          </div>
        </div>

        <div class="boat-description">
          <div class="description-label">
            상세 설명
          </div>
          <div class="description-content">
            {{ props.product.prodDescription }}
          </div>
        </div>

        <div class="boat-description">
          <div class="description-label">
            공지사항
          </div>
          <div class="description-content">
            {{ props.product.prodNotice }}
          </div>
        </div>

        <div class="boat-description">
          <div class="description-label">
            이벤트
          </div>
          <div class="description-content">
            {{ props.product.prodEvent }}
          </div>
        </div>

      </div>
    </div>

    <!-- 신고 모달 -->
    <div v-if="showReportForm" class="modal-overlay" @click="closeReportForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-flag"></i>
            {{ props.product.prodName }} 신고
          </h3>
          <button @click="closeReportForm" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitReport" class="modal-body">
          <div class="form-group">
            <label for="reportReason" class="form-label">신고 사유</label>
            <textarea
              id="reportReason"
              v-model="reportReason"
              required
              placeholder="신고 사유를 상세히 입력해주세요"
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeReportForm">
              취소
            </button>
            <button type="submit" class="btn btn-danger">
              <i class="fas fa-flag"></i>
              신고하기
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 이미지 모달 -->
    <div v-if="showImageModal" class="image-modal-overlay" @click.self="closeImageModal">
      <div class="image-modal-content">
        <button class="modal-close-btn" @click="closeImageModal">×</button>
        <Swiper
          :modules="[Navigation, Pagination]"
          :slides-per-view="1"
          :space-between="10"
          navigation
          pagination
          :initial-slide="modalStartIndex"
          class="modal-swiper"
        >
          <SwiperSlide
            v-for="(img, idx) in imageList"
            :key="'modal-'+idx"
          >
            <img :src="img" class="modal-slide-image" alt="상품 이미지" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>
</template>

<style>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 페이지 헤더 */
.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.header-left {
  flex: 1;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.breadcrumb {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #718096;
}

.separator {
  color: #cbd5e0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.no-image-placeholder {
  width: 100vw;
  max-width: 500px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #edf2f7;
  color: #a0aec0;
  font-size: 1.2rem;
  border-radius: 16px;
}

/* 메인 상품 정보 */
.product-main-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  height: 500px; /* 원하는 높이 고정 */
}

.main-swiper {
  max-width: 500px;
  width: 100%;
  height: 500px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.swiper-wrapper {
  /* Swiper 내부 래퍼 */
  display: flex !important;
}

.swiper-slide {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}

/* Swiper 좌우 화살표 스타일 커스터마이징 */
.swiper-button-prev,
.swiper-button-next {
  color: white;
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  backdrop-filter: blur(4px);
}

.swiper-button-prev::after,
.swiper-button-next::after {
  font-size: 20px;
  font-weight: bold;
}


.product-info-section {
  flex: 1;
  min-width: 0;
}

/* 썸네일 섹션 */
.thumbnail-section {
  flex-basis: 50%;
  height: 100%; /* 부모 높이 꽉 채우기 */
}

.thumbnail-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px 0 0 16px;
}

.product-thumbnail {
  width: 100%;
  height: 500px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnail-container:hover .product-thumbnail {
  transform: scale(1.05);
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-container:hover .thumbnail-overlay {
  opacity: 1;
}

.zoom-icon {
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #2d3748;
}

/* 상품 정보 섹션 */
.product-info-section {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-header {
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #3182ce, #2c5282);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
}

/* 상품 상세 정보 */
.product-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #4299e1;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #4a5568;
  min-width: 100px;
}

.detail-label i {
  color: #4299e1;
  width: 16px;
}

.detail-value {
  font-weight: 500;
  color: #2d3748;
  margin-left: auto;
}

/* 배 정보 박스 */
.boat-info-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-bottom: 40px;
}

.boat-info-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 24px 32px;
  color: white;
}

.boat-info-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.boat-info-title i {
  font-size: 1.3rem;
}

.boat-info-content {
  padding: 32px;
}

.boat-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 3%;
}

.boat-detail-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.boat-detail-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #4a5568;
  min-width: 120px;
}

.boat-detail-label i {
  color: #667eea;
  width: 18px;
}

.boat-detail-value {
  font-weight: 500;
  color: #2d3748;
  margin-left: auto;
}

.boat-description {
  background: #f7fafc;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  margin-bottom: 3%;
}

.description-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 16px;
}

.description-label i {
  color: #667eea;
}

.description-content {
  color: #2d3748;
  line-height: 1.6;
  font-size: 1.5rem;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: rgba(255,255,255,0.1);
}

.modal-body {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
}

.form-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: #4299e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
  transform: translateY(-1px);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .page-title {
    font-size: 2rem;
    text-align: center;
  }

  .breadcrumb {
    justify-content: center;
  }

  .product-main-info {
    grid-template-columns: 1fr 1fr; /* 2열 동일 비율 */
    gap: 20px;
  }

  .thumbnail-container {
    border-radius: 16px;
  }

  .product-info-section {
    padding: 24px;
  }

  .boat-detail-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}

/* 이미지 모달 스타일 */
.image-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-modal-content {
  position: relative;
  background: transparent;
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  border-radius: 16px;
  overflow: hidden;
}
.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 18px;
  font-size: 2rem;
  color: #fff;
  background: none;
  border: none;
  z-index: 10;
  cursor: pointer;
}
.modal-swiper {
  width: 100%;
  height: 70vh;
  background: transparent;
}
.modal-slide-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #222;
  border-radius: 12px;
}
</style>

