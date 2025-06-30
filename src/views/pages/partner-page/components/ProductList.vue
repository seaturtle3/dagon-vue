<template>
  <div class="product-list">
    <div class="header">
      <h1 class="page-title">상품 관리</h1>
      <button class="register-button" @click="goToProductForm">
        상품 등록
      </button>
    </div>

    <div class="filter-section">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="상품명을 입력하세요">
        <button class="search-button" @click="searchProducts"><i class="fa-solid fa-eye"></i></button>
      </div>
      
      <div class="filter-options">
        <select v-model="typeFilter" @change="filterProducts">
          <option value="all">전체</option>
          <option value="SEA">바다낚시</option>
          <option value="FRESHWATER">민물낚시</option>
        </select>
        <select v-model="statusFilter" @change="filterProducts">
          <option value="all">전체 상태</option>
          <option value="active">공개</option>
          <option value="deleted">비공개</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">로딩 중...</div>
    <div v-else-if="products.length === 0" class="no-products">
      등록된 상품이 없습니다.
    </div>
    <div v-else class="product-grid">
      <div v-for="product in filteredProducts" :key="product.prodId" class="product-card" :class="{ 'deleted': product.deleted }">
        <div class="product-image" @click="$router.push(`/partner/products/${product.prodId}`)">
          <div class="image-thumbnails">
            <!-- 1. prodImageDataList가 있으면 그것만 보여줌 -->
            <template v-if="product.prodImageDataList && product.prodImageDataList.length > 0">
              <div v-for="(imgData, idx) in product.prodImageDataList" :key="idx">
                <img
                  :src="imgData.startsWith('data:image') ? imgData : `data:image/jpeg;base64,${imgData}`"
                  class="thumbnail-img"
                  @error="e => { e.target.src = defaultImage }"
                >
              </div>
            </template>
            <!-- 2. prodImageNames가 있으면 그것만 보여줌 -->
            <template v-else-if="product.prodImageNames && product.prodImageNames.length > 0">
              <div v-for="img in product.prodImageNames" :key="img">
                <img
                  :src="img.startsWith('/') ? img : `${BASE_URL}/uploads/products/${img}`"
                  class="thumbnail-img"
                  @error="e => { e.target.src = defaultImage }"
                >
              </div>
            </template>
            <!-- 3. 둘 다 없으면 placeholder -->
            <template v-else>
              <div class="image-placeholder">
                <i class="fas fa-ship"></i>
                <span>이미지 없음</span>
              </div>
            </template>
          </div>
          <span :class="['type-badge', product.mainType?.toLowerCase()]">
            {{ getTypeText(product.mainType) }}
          </span>
          <div v-if="product.deleted" class="deleted-badge">
            <i class="fas fa-times-circle"></i> 비공개
          </div>
        </div>
        
        <div class="product-info">
          <h3 class="product-name">
            {{ product.prodName }}
            <span v-if="product.deleted" class="deleted-mark">
              <i class="fas fa-times"></i>
            </span>
          </h3>
          <p class="product-region">{{ product.prodRegion || '지역 미지정' }}</p>
          <p class="product-subtype">{{ getSubTypeText(product.subType) }}</p>
          <div class="product-actions">
            <button v-if="!product.deleted" class="delete-button" @click.stop="deleteProduct(product.prodId)">비공개</button>
            <button v-else class="restore-button" @click.stop="restoreProduct(product.prodId)">복구</button>
            <button class="report-button" @click="goToCreateReport(product.prodId)">
              조황 등록
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 조황 등록 폼 (오버레이) -->
    <div v-if="showCreateReportFormForProduct" class="create-report-overlay">
      <div class="create-report-form-container">
        <div class="form-header">
        <h3>{{ getProductNameForReport() }} 조황정보 등록</h3>
          <button class="close-button" @click="cancelCreateReport">
            <i class="fas fa-times"></i>
          </button>
          </div>

        <!-- ReportFormView 컴포넌트 사용 -->
        <ReportFormView
          :dto="reportDto"
          :loading="reportLoading"
          :error="reportError"
          @submit-success="handleReportSuccess"
          @submit-error="handleReportError"
        />
      </div>
    </div>

    <!-- 상품 신고 폼 (오버레이) -->
    <div v-if="showReportProductForm" class="report-product-overlay">
      <div class="report-product-form-container">
        <h3>{{ getProductNameForReport() }} 신고</h3>
        <form @submit.prevent="submitProductReport">
          <div class="form-group">
            <label for="reportReason">신고 사유</label>
            <textarea
              id="reportReason"
              v-model="productReport.reason"
              required
              placeholder="신고 사유를 입력해주세요"
              rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">신고하기</button>
            <button type="button" class="cancel-button" @click="cancelReportProduct">취소</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BASE_URL } from '@/constants/baseUrl.js'
import { partnerService } from '@/api/partner'
import ReportFormView from '@/views/community/fishing-report/components/ReportFormView.vue'
import { createProduct, updateProduct } from "@/api/product.js";
import { useRoute, useRouter } from 'vue-router'
import { useProductFormStore } from '@/store/product/all-products/useProductFormStore'

const router = useRouter()

const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const products = ref([])
const defaultImage = '/images/default-product.jpg'
const showCreateReportFormForProduct = ref(false)
const selectedProdId = ref(null)
const reportDto = ref({
  title: '',
  content: '',
  fishingAt: '',
  product: null
})
const reportLoading = ref(false)
const reportError = ref(null)
const thumbnailFile = ref(null)
const thumbnailPreview = ref(null)
const loading = ref(false)
const showReportProductForm = ref(false)
const productReport = ref({ reason: '' })

const productFormStore = useProductFormStore()

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.prodName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = typeFilter.value === 'all' || product.mainType === typeFilter.value
    const matchesStatus = statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && !product.deleted) ||
      (statusFilter.value === 'deleted' && product.deleted)
    return matchesSearch && matchesType && matchesStatus
  })
})

async function loadProducts() {
  try {
    loading.value = true
    const response = await partnerService.getPartnerAllProducts()
    products.value = response.data.map(product => ({
      ...product,
      deleted: product.deleted || false
    }))
  } catch (error) {
    alert('상품 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

function getThumbnailUrl(product) {
  if (product.prodImageNames && product.prodImageNames.length > 0) {
    const firstImage = product.prodImageNames[0]
    if (firstImage) {
      return `${BASE_URL}${firstImage}`
    }
  }
  if (product.prodThumbnail) {
    return partnerService.getThumbnailUrl(product.prodThumbnail)
  }
  return defaultImage
}

function hasImage(product) {
  return (
    (product.prodImageNames && product.prodImageNames.length > 0 && product.prodImageNames[0]) ||
    product.prodThumbnail
  )
}

function getTypeText(type) {
  return type === 'SEA' ? '바다낚시' : type === 'FRESHWATER' ? '민물낚시' : '미지정'
}

function getSubTypeText(subType) {
  const subTypeMap = {
    'BREAK_WATER': '방파제',
    'ROCKY_SHORE': '갯바위',
    'ESTUARY': '하구',
    'BOAT': '선상',
    'MUD_FLAT': '갯벌',
    'ARTIFICIAL': '인공낚시터',
    'OPEN_SEA': '해상',
    'BEACH': '해변',
    'REEF': '암초',
    'OTHER_SEA': '기타_바다',
    'RIVER': '강',
    'RESERVOIR': '저수지',
    'DAM': '댐',
    'POND': '연못',
    'SMALL_LAKE': '소류지',
    'CANAL': '수로',
    'FLOATING_PLATFORM': '좌대',
    'OPEN_AREA': '노지',
    'OTHER_FRESHWATER': '기타_민물'
  }
  return subTypeMap[subType] || '미지정'
}

function searchProducts() {}
function filterProducts() {}

function deleteProduct(prodId) {
  alert('준비중입니다.')
}

async function restoreProduct(prodId) {
  if (!confirm('이 상품을 다시 공개하시겠습니까?')) return
  try {
    await partnerService.restoreProduct(prodId)
    alert('상품이 성공적으로 복구되었습니다.')
    await loadProducts()
  } catch (error) {
    alert(error.response?.data?.message || '상품 복구에 실패했습니다.')
  }
}

function openCreateReportForm(prodId) {
  selectedProdId.value = prodId
  showCreateReportFormForProduct.value = true
  resetNewReportForm()
  const selectedProduct = products.value.find(p => p.prodId === prodId)
  if (selectedProduct) {
    reportDto.value.product = {
      prodId: selectedProduct.prodId,
      prodName: selectedProduct.prodName
    }
  }
}

function cancelCreateReport() {
  showCreateReportFormForProduct.value = false
  selectedProdId.value = null
  resetNewReportForm()
}

function resetNewReportForm() {
  reportDto.value = {
    title: '',
    content: '',
    fishingAt: '',
    product: null
  }
  reportLoading.value = false
  reportError.value = null
  thumbnailFile.value = null
  thumbnailPreview.value = null
}

function handleReportSuccess(data) {
  alert('조황정보가 성공적으로 등록되었습니다.')
  cancelCreateReport()
}

function handleReportError(error) {
  reportError.value = error.message || '조황정보 등록에 실패했습니다.'
}

function handleThumbnailChange(event) {
  const file = event.target.files[0]
  if (file) {
    thumbnailFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    thumbnailFile.value = null
    thumbnailPreview.value = null
  }
}

function getProductNameForReport() {
  const product = products.value.find(p => p.prodId === selectedProdId.value)
  return product ? product.prodName : ''
}

function openReportProductForm(prodId, prodName) {
  selectedProdId.value = prodId
  showReportProductForm.value = true
}

function cancelReportProduct() {
  showReportProductForm.value = false
  selectedProdId.value = null
  productReport.value = { reason: '' }
}

async function submitProductReport() {
  if (!confirm('제품을 신고하시겠습니까?')) return
  try {
    await partnerService.reportProduct(selectedProdId.value, productReport.value.reason)
    alert('제품이 성공적으로 신고되었습니다.')
    cancelReportProduct()
  } catch (error) {
    alert(error.response?.data?.message || '제품 신고에 실패했습니다. 다시 시도해주세요.')
  }
}

function goToProductForm() {
  router.push('/partner/products/form')
}

function goToCreateReport(prodId) {
  router.push({ path: '/fishing-report/create', query: { prodId } })
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-list {
  padding: 30px;
  width: 100%;
  margin: 0;
  background-color: #e3f2fd;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.page-title {
  margin: 0;
  color: #1565c0;
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.register-button {
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.register-button:hover {
  background-color: #1565c0;
  transform: translateY(-2px);
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #90caf9;
}

.search-box {
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: 500px;
}

.search-box input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.search-button {
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
  writing-mode: horizontal-tb; /* 글자를 다시 가로로 정렬 */
  text-orientation: mixed; /* 글자 방향 유지 */
}

.search-button:hover {
  background-color: #1565c0;
  transform: translateY(-2px);
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-options select {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-options select:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.product-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.product-image, .image-placeholder {
  position: relative;
  height: 220px;
  overflow: hidden;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f5f5f5 !important;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f5f5f5;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.type-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: white;
  font-weight: 600;
}

.type-badge.sea {
  background-color: #3498db;
}

.type-badge.freshwater {
  background-color: #2ecc71;
}

.product-info {
  padding: 20px;
}

.product-name {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.product-region {
  margin: 0 0 8px;
  color: #666;
  font-size: 1rem;
}

.product-subtype {
  margin: 0 0 15px;
  color: #1a237e;
  font-size: 1rem;
  font-weight: 500;
}

.no-products {
  text-align: center;
  padding: 80px;
  color: #666;
  font-size: 1.3rem;
  background: #ffffff;
  border-radius: 10px;
  border: 1px dashed #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.product-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.delete-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  background-color: #e57373;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background-color: #ef5350;
  transform: translateY(-2px);
}

/* 조황 등록 버튼 스타일 */
.report-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  background-color: #3498db;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-left: 10px; /* 삭제 버튼과의 간격 */
}

.report-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

/* 새롭게 추가된 오버레이 스타일 */
.create-report-overlay {
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

.create-report-form-container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 800px; /* FishingReportManager.vue와 동일한 max-width */
  max-height: 90vh;
  overflow-y: auto;
  margin-top: 0; /* 기존 margin-top 제거 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* 그림자 추가 */
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.form-header h3 {
  margin: 0;
  color: #1a237e;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.create-report-form-container .form-group {
  margin-bottom: 20px; /* 여백 조정 */
}

.create-report-form-container label {
  margin-bottom: 8px; /* 여백 조정 */
  font-weight: 600; /* 폰트 두께 */
}

.create-report-form-container input[type="text"],
.create-report-form-container input[type="date"],
.create-report-form-container textarea {
  padding: 12px; /* 패딩 조정 */
  border-radius: 6px; /* 둥근 모서리 */
  font-size: 1rem; /* 폰트 크기 조정 */
}

.create-report-form-container input[type="text"]:focus,
.create-report-form-container input[type="date"]:focus,
.create-report-form-container textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  outline: none;
}

.create-report-form-container textarea {
  resize: vertical;
}

.create-report-form-container .thumbnail-preview {
  margin-top: 10px;
  max-width: 100px;
}

.create-report-form-container .thumbnail-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.create-report-form-container .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 0; /* 기존 product-actions의 padding-top 제거 */
  border-top: none; /* 기존 product-actions의 border-top 제거 */
}

.create-report-form-container .submit-button,
.create-report-form-container .cancel-button {
  padding: 8px 18px;
  font-size: 0.9rem;
  font-weight: 500;
}

.create-report-form-container .submit-button {
  background-color: #28a745; /* 녹색 계열 */
}

.create-report-form-container .submit-button:hover {
  background-color: #218838;
}

.create-report-form-container .cancel-button {
  background-color: #6c757d; /* 회색 계열 */
}

.create-report-form-container .cancel-button:hover {
  background-color: #5a6268;
}

/* 반응형 조정 추가 */
@media (max-width: 992px) {
  .product-list {
    padding: 20px;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

.deleted-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
}

.deleted-badge i {
  font-size: 1.2em;
}

.deleted-mark {
  color: #dc3545;
  font-size: 1em;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
}

.deleted-mark i {
  font-size: 1.1em;
}

.product-card.deleted {
  opacity: 0.85;
  background-color: #f8f9fa;
  border: 1px solid #dc3545;
}

.product-card.deleted .product-image img {
  filter: grayscale(70%);
}

.product-card.deleted .product-name {
  color: #6c757d;
}

.restore-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  background-color: #2ecc71;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.restore-button:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
}

/* 상품 신고 폼 스타일 */
.report-product-overlay {
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

.report-product-form-container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  margin-top: 0;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.report-product-form-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #1a237e;
  font-size: 1.5rem;
}

.report-product-form-container .form-group {
  margin-bottom: 20px;
}

.report-product-form-container label {
  margin-bottom: 8px;
  font-weight: 600;
}

.report-product-form-container textarea {
  padding: 12px;
  border-radius: 6px;
  font-size: 1rem;
}

.report-product-form-container .form-actions {
  margin-top: 30px;
  padding-top: 0;
  border-top: none;
}

.report-product-form-container .submit-button,
.report-product-form-container .cancel-button {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
}

.report-product-form-container .submit-button {
  background-color: #4CAF50;
}

.report-product-form-container .submit-button:hover {
  background-color: #45a049;
}

.report-product-form-container .cancel-button {
  background-color: #6c757d;
  color: white;
}

.report-product-form-container .cancel-button:hover {
  background-color: #5a6268;
}

.status-badge.active {
  background-color: #1976d2;
}
.status-badge.inactive {
  background-color: #90caf9;
}
.status-badge.sold-out {
  background-color: #e57373;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style> 