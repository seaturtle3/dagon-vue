<script setup>
import {ref, onMounted, computed, watch, onUnmounted, nextTick} from 'vue'
import api from '@/lib/axios.js'
import {useAdminAuthStore} from '@/store/auth/auth.js'
import {useAuthStore} from '@/store/login/loginStore.js'
import {useRouter} from 'vue-router'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import {useProductListStore} from '@/store/product/all-products/useProductListStore.js'
import {getProductsByKeyword} from '@/api/product.js'
import {useFishingReportStore} from '@/store/fishing-center/useFishingReportStore.js'

const props = defineProps({
  dto: Object,
  loading: Boolean,
  error: String,
  editMode: Boolean,
  reportId: [String, Number]
})

const emit = defineEmits(['thumbnail-change', 'file-change', 'submit-success', 'submit-error'])

const router = useRouter()
const thumbnailFile = ref(null)
const thumbnailPreviewUrl = ref('')
const formData = ref({
  title: '',
  content: '',
  fishingAt: new Date().toISOString().split('T')[0],
  location: '',
  imageFileName: '',
  thumbnailUrl: '',
  user: null,
  comments: [],
  thumbnail_image_data: null
})

const adminAuthStore = useAdminAuthStore()
const authStore = useAuthStore()
const productListStore = useProductListStore()
const selectedProduct = ref(null)
const productSearch = ref('')
const productOptions = ref([])
const productSearchLoading = ref(false)
const highlightedIndex = ref(-1)
const productInputRef = ref(null)
const dateInputRef = ref(null)
const fishingReportStore = useFishingReportStore()
const titleInputRef = ref(null)
const showAutocomplete = ref(false)
const report = computed(() => fishingReportStore.currentReport)

const isFormValid = computed(() => {
  return (
      formData.value.title &&
      formData.value.content &&
      formData.value.fishingAt &&
      formData.value.location &&
      selectedProduct.value
  )
})

// 토큰 검증 및 갱신
async function validateAndRefreshToken() {
  try {
    console.log('토큰 검증 시작...')

    // 현재 토큰 상태 확인
    const currentToken = localStorage.getItem('token')
    if (!currentToken) {
      console.log('토큰이 없습니다. 로그인이 필요합니다.')
      alert('로그인이 필요합니다.')
      router.push('/login')
      return false
    }

    // adminAuthStore에 토큰이 없으면 설정
    if (!adminAuthStore.token) {
      console.log('adminAuthStore에 토큰 설정')
      adminAuthStore.setToken(currentToken)
    }

    console.log('토큰이 존재합니다. API 요청을 시도합니다.')
    return true

  } catch (error) {
    console.error('토큰 검증 중 오류:', error)
    // 토큰을 초기화하지 않고 에러만 로그
    console.log('토큰 검증 오류가 발생했지만 토큰은 유지합니다.')
    return true // 토큰이 있으면 일단 시도
  }
}

// 모든 토큰 및 인증 정보 초기화 (사용하지 않음)
function clearAllTokens() {
  console.log('토큰 초기화 함수가 호출되었지만 토큰을 보존합니다.')
  // 토큰을 초기화하지 않음
}

// 디버깅용: 현재 토큰 상태 확인
function checkTokenStatus() {
  console.log('=== 토큰 상태 확인 ===')
  console.log('localStorage token:', localStorage.getItem('token'))
  console.log('localStorage userInfo:', localStorage.getItem('userInfo'))
  console.log('axios headers:', api.defaults.headers.common['Authorization'])
  console.log('adminAuthStore token:', adminAuthStore.token)
  console.log('adminAuthStore isAuthenticated:', adminAuthStore.isAuthenticated)
  console.log('authStore isAuthenticated:', authStore.isAuthenticated)
  console.log('========================')
}

function onThumbnailChange(event) {
  const file = event.target.files[0]
  if (file) {
    // 기존 URL 정리
    if (thumbnailPreviewUrl.value) {
      URL.revokeObjectURL(thumbnailPreviewUrl.value)
    }

    thumbnailFile.value = file
    thumbnailPreviewUrl.value = URL.createObjectURL(file)
    emit('thumbnail-change', event)
  }
}

function removeThumbnail() {
  if (thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
  }
  thumbnailFile.value = null
  thumbnailPreviewUrl.value = ''
}

onMounted(async () => {
  // localStorage에서 토큰 로드
  const token = localStorage.getItem('token')
  if (token && !adminAuthStore.token) {
    console.log('페이지 로드 시 토큰 설정')
    adminAuthStore.setToken(token)
  }

  // 현재 토큰 상태 확인
  checkTokenStatus()

  // 페이지 로드 시 토큰 검증
  const tokenValid = await validateAndRefreshToken()
  if (!tokenValid) {
    console.log('토큰 검증 실패, 페이지 로드 중단')
    return
  }

  // 검증 후 토큰 상태 재확인
  checkTokenStatus()

  // RichTextEditor는 컴포넌트에서 자동으로 초기화됩니다
  await productListStore.fetchProducts()
  // 수정 모드일 때 기존 데이터 불러오기
  if (props.editMode && props.reportId) {
    await fishingReportStore.fetchReportById(props.reportId)
    const report = fishingReportStore.currentReport
    if (report) {
      formData.value.title = report.title
      formData.value.content = report.content
      formData.value.fishingAt = report.fishingAt
      formData.value.location = report.location
      formData.value.productId = report.product?.prodId
      formData.value.productName = report.product?.prodName
      formData.value.imageFileName = report.imageFileName
      formData.value.thumbnailUrl = report.thumbnailUrl
      formData.value.user = report.user
      formData.value.comments = report.comments
      formData.value.images = report.images // 또는 report.images를 별도 변수로 사용

      console.log('report.images:', report.images)
      // 상품 선택 세팅
      if (report.product) {
        selectedProduct.value = report.product
        productSearch.value = report.product.prodName
      }
      // 썸네일 프리뷰
      if (report.thumbnailUrl) {
        thumbnailPreviewUrl.value = report.thumbnailUrl.startsWith('http') ? report.thumbnailUrl : `/api/fishing-report/images/${report.thumbnailUrl}`
      }
    }
    // DOM 업데이트 후 blur 처리
    await nextTick()
    if (productInputRef.value) {
      productInputRef.value.blur()
    }
    if (titleInputRef.value) {
      titleInputRef.value.focus()
    }
  }

  console.log('editMode:', props.editMode, 'reportId:', props.reportId)
})

async function onSubmit() {
  if (!isFormValid.value) {
    alert('필수 항목을 모두 입력해주세요. (제목, 내용, 날짜, 장소, 상품)')
    return
  }
  if (!formData.value.fishingAt) {
    alert('낚시 날짜를 입력하세요.');
    return;
  }

  // 이미지 파일 검증
  if (thumbnailFile.value) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (thumbnailFile.value.size > maxSize) {
      alert('이미지 파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(thumbnailFile.value.type)) {
      alert('지원되는 이미지 형식: JPG, PNG, GIF');
      return;
    }
  }

  const dtoToSend = {
    title: formData.value.title,
    content: formData.value.content,
    prodName: selectedProduct.value ? selectedProduct.value.prodName : '',
    fishingAt: formData.value.fishingAt,
    location: formData.value.location,
    imageFileName: thumbnailFile.value ? thumbnailFile.value.name : null,
    product: selectedProduct.value ? {
      prodId: selectedProduct.value.prodId,
      prodName: selectedProduct.value.prodName
    } : null,
    user: report.value && report.value.user
      ? report.value.user
      : (authStore.user ? { userId: authStore.user.userId } : null),
    comments: [],
    thumbnailUrl: null
  }

  try {
    if (props.editMode && props.reportId) {
      // 수정 모드: 수정 API 호출
      await fishingReportStore.updateFishingReport(props.reportId, dtoToSend, thumbnailFile.value)
      alert('조황정보가 성공적으로 수정되었습니다!')
      router.push(`/fishing-report/${props.reportId}`)
    } else {
      // 등록 모드: 등록 API 호출
      await fishingReportStore.createFishingReport(dtoToSend, thumbnailFile.value)
      // 임시: 최신 조황정보 frId로 이동
      const listRes = await fishingReportStore.fetchReports({ page: 0, size: 1, sort: 'frId,DESC' })
      const frId = listRes?.data?.content?.[0]?.frId || null
      if (frId) router.push(`/fishing-report/${frId}`)
      else router.push('/fishing-report')
    }

  } catch (err) {
    console.error('조황정보 등록/수정 실패:', err)
    if (err.response?.data?.message) {
      alert(`조황정보 등록/수정 실패: ${err.response.data.message}`)
    } else if (err.response?.status === 500) {
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else {
      alert('조황정보 등록/수정에 실패했습니다. 다시 시도해주세요.')
    }
  }
}

function resetForm() {
  formData.value = {
    title: '',
    content: '',
    fishingAt: new Date().toISOString().split('T')[0],
    location: '',
    productId: null,
    productName: '',
    imageFileName: '',
    thumbnailUrl: '',
    user: null,
    comments: [],
    thumbnail_image_data: null
  }
  if (thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
  }
  thumbnailFile.value = null
  thumbnailPreviewUrl.value = ''
  selectedProduct.value = null
  // RichTextEditor는 v-model로 자동으로 초기화됩니다
}

watch(productSearch, async (newVal) => {
  if (newVal && newVal.length >= 2) {
    productSearchLoading.value = true
    try {
      const res = await getProductsByKeyword(newVal)
      productOptions.value = res.data.content || []
    } catch (e) {
      productOptions.value = []
    } finally {
      productSearchLoading.value = false
    }
  } else {
    productOptions.value = []
  }
})

function onProductInputKeydown(e) {
  if (productOptions.value.length === 0) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = (highlightedIndex.value + 1) % productOptions.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = (highlightedIndex.value - 1 + productOptions.value.length) % productOptions.value.length
  } else if (e.key === 'Enter') {
    if (highlightedIndex.value >= 0 && highlightedIndex.value < productOptions.value.length) {
      selectedProduct.value = productOptions.value[highlightedIndex.value]
      productSearch.value = selectedProduct.value.prodName
      productOptions.value = []
      highlightedIndex.value = -1
    }
  } else if (e.key === 'Escape') {
    productOptions.value = []
    highlightedIndex.value = -1
  }
}

watch(productOptions, (newVal) => {
  if (newVal.length > 0) highlightedIndex.value = 0
  else highlightedIndex.value = -1
})

// 상품 자동완성 입력란 포커스 아웃 시 선택박스 닫기
function onProductInputBlur(e) {
  setTimeout(() => {
    productOptions.value = []
    highlightedIndex.value = -1
  }, 200)
}

// 날짜 선택기 열기
function openDatePicker() {
  if (dateInputRef.value) {
    dateInputRef.value.showPicker()
  }
}

// 날짜 입력 필드 클릭 시 달력 열기
function onDateInputClick() {
  openDatePicker()
}

onUnmounted(() => {
  if (thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
  }
})

function selectProduct(option) {
  selectedProduct.value = option
  productSearch.value = option.prodName
  showAutocomplete.value = false
  highlightedIndex.value = -1
  // input blur로 포커스 해제
  if (productInputRef.value) {
    productInputRef.value.blur()
  }
}

function onProductInputFocus() {
  if (productOptions.value.length > 0) {
    showAutocomplete.value = true
  }
}
</script>

<template>
  <div class="form-container">
    <div class="form-header">
      <h2 class="form-title">
        {{ editMode ? '🎣 조황정보 수정' : '🎣 조황정보 등록' }}
      </h2>
      <p class="form-subtitle">
        {{ editMode ? '조황정보를 수정합니다.' : '오늘의 낚시 조황을 공유해보세요!' }}
      </p>
    </div>

    <form @submit.prevent="onSubmit">
      <!-- 기본 정보 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📝 기본 정보</h3>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">제목</label>
            <input v-model="formData.title" type="text" class="form-control" placeholder="조황정보 제목을 입력하세요" required
                   ref="titleInputRef"/>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">낚시 날짜</label>
            <div class="date-input-container">
              <input v-model="formData.fishingAt" type="date" class="form-control date-input" placeholder="날짜를 선택하세요"
                     required ref="dateInputRef" @click="onDateInputClick"/>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">낚시 장소</label>
            <input v-model="formData.location" type="text" class="form-control" placeholder="낚시한 장소를 입력하세요" required/>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="position:relative;">
            <label class="form-label required">상품 선택</label>
            <input
                v-model="productSearch"
                type="text"
                class="form-control"
                placeholder="상품명을 입력하세요 (2글자 이상)"
                autocomplete="off"
                ref="productInputRef"
                @keydown="onProductInputKeydown"
                @blur="onProductInputBlur"
                @focus="onProductInputFocus"
            />
            <div v-if="productSearchLoading" style="color: #1976d2; font-size: 0.9em;">검색 중...</div>
            <ul v-if="showAutocomplete" class="autocomplete-list">
              <li
                  v-for="(option, idx) in productOptions"
                  :key="option.prodId"
                  @click="selectProduct(option)"
                  :class="['autocomplete-item', { highlighted: idx === highlightedIndex }]"
              >
                {{ option.prodName }}
              </li>
            </ul>
            <div v-if="selectedProduct" class="selected-product-info">
              선택된 상품: <strong>{{ selectedProduct.prodName }}</strong>
              <button type="button" @click="selectedProduct = null; productSearch = ''"
                      style="margin-left:8px; color:#f44336; background:none; border:none; cursor:pointer;">선택 취소
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 이미지 & 내용 작성 섹션 -->
      <div class="form-section content-section">
        <h3 class="section-title">📝 {{ editMode ? '조황정보 수정' : '조황정보 작성' }}</h3>

        <div class="content-layout">
          <!-- 이미지 업로드 영역 -->
          <div class="image-upload-section">
            <label class="form-label">대표 이미지</label>
            <div class="image-upload-container">
              <div class="image-preview-area">
                <div v-if="!thumbnailFile" class="upload-placeholder">
                  <div class="upload-icon">📸</div>
                  <div class="upload-text">
                    <span class="upload-title">이미지를 선택해주세요</span>
                    <span class="upload-subtitle">클릭하여 파일 선택</span>
                  </div>
                </div>
                <div v-else class="image-preview">
                  <img
                      v-if="thumbnailPreviewUrl"
                      :src="thumbnailPreviewUrl"
                      alt="미리보기"
                      class="preview-image"
                  />
                  <!-- thumbnailPreviewUrl이 없고, image_data가 있다면 -->
                  <img
                      v-else-if="formData.thumbnail_image_data"
                      :src="`data:image/jpeg;base64,${formData.thumbnail_image_data}`"
                      alt="미리보기"
                      class="preview-image"
                  />
                  <div class="image-overlay">
                    <button type="button" @click="removeThumbnail" class="remove-image-btn">
                      <span>✕</span>
                    </button>
                  </div>
                </div>
              </div>
              <input type="file" accept="image/*" class="upload-input" @change="onThumbnailChange"/>
            </div>
            <div v-if="thumbnailFile" class="file-info">
              <span class="file-name">{{ thumbnailFile.name }}</span>
            </div>
          </div>
          <div v-if="editMode && report && report.images && report.images.length" class="image-list">
            <div v-for="(img, idx) in report.images" :key="idx" class="image-preview">
              <img
                  v-if="img.imageData"
                  :src="`data:image/jpeg;base64,${img.imageData}`"
                  alt="등록된 이미지"
                  style="max-width: 120px; max-height: 120px; margin: 8px;"
              />
              <img
                  v-else-if="img.imageUrl"
                  :src="img.imageUrl"
                  alt="등록된 이미지"
                  style="max-width: 120px; max-height: 120px; margin: 8px;"
              />
              <span v-else>이미지 없음</span>
            </div>
          </div>

          <!-- 내용 작성 영역 -->
          <div class="content-editor-section">
            <div class="form-group">
              <label class="form-label required">조황정보 내용</label>
              <RichTextEditor v-model="formData.content" editor-id="fishing-report-editor"/>
            </div>
          </div>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- 버튼 그룹 -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn btn-secondary">
          초기화
        </button>
        <button type="submit" :disabled="!isFormValid || loading" class="btn btn-primary">
          {{ loading ? '등록 중...' : '조황정보 등록' }}
        </button>
      </div>
    </form>

  </div>
</template>

<style scoped>
.form-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e3f2fd;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 8px;
}

.form-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-label.required::after {
  content: ' *';
  color: #f44336;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

/* 날짜 입력 필드 스타일 */
.date-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  cursor: pointer;
}

/* RichTextEditor 스타일 조정 */
.form-group :deep(.note-editor) {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.form-group :deep(.note-editor:focus-within) {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

/* 새로운 콘텐츠 섹션 스타일 */
.content-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
  border-left: 4px solid #1976d2;
}

.content-layout {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.image-upload-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.image-upload-section:hover {
  border-color: #1976d2;
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.15);
}

.image-upload-container {
  position: relative;
  cursor: pointer;
}

.image-preview-area {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-container:hover .image-preview-area {
  border-color: #1976d2;
  background: #f8f9fa;
}

.upload-placeholder {
  text-align: center;
  padding: 40px 20px;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 3.5rem;
  margin-bottom: 15px;
  display: block;
  opacity: 0.7;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.upload-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1976d2;
}

.upload-subtitle {
  font-size: 0.95rem;
  color: #666;
}

.upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.remove-image-btn {
  background: #f44336;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.remove-image-btn:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

.file-info {
  margin-top: 15px;
  text-align: center;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.file-name {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.content-editor-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e0e0e0;
}

.content-editor-section .form-group {
  margin-bottom: 0;
}

.content-editor-section :deep(.note-editor) {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  min-height: 350px;
}

.content-editor-section :deep(.note-editor:focus-within) {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #f44336;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e3f2fd;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .content-layout {
    gap: 20px;
  }

  .image-upload-section {
    padding: 20px;
  }

  .image-preview-area {
    min-height: 150px;
  }

  .upload-placeholder {
    padding: 30px 15px;
  }

  .upload-icon {
    font-size: 3rem;
  }

  .upload-title {
    font-size: 1.1rem;
  }

  .content-editor-section {
    padding: 20px;
  }

  .content-editor-section :deep(.note-editor) {
    min-height: 300px;
  }

  .remove-image-btn {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
}

.autocomplete-list {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 180px;
  overflow-y: auto;
  position: absolute;
  z-index: 10;
  width: 100%;
  min-width: 120px;
  left: 0;
  top: 100%;
  box-sizing: border-box;
}

.autocomplete-item {
  padding: 8px 12px;
  cursor: pointer;
}

.autocomplete-item.highlighted,
.autocomplete-item:hover {
  background: #e3f2fd;
}

.selected-product-info {
  margin-top: 8px;
  color: #1976d2;
  font-size: 0.95em;
}

.image-list {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-preview {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview span {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
}
</style>
