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
const autocompleteRef = ref(null)

const isFormValid = computed(() => {
  const hasThumbnail = thumbnailFile.value || 
    (props.editMode && report.value && report.value.images && report.value.images.length > 0) ||
    (props.editMode && report.value && report.value.thumbnailUrl);
  
  return (
      formData.value.title &&
      formData.value.content &&
      formData.value.fishingAt &&
      selectedProduct.value &&
      hasThumbnail // 수정 모드에서는 기존 썸네일도 허용
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
          formData.value.productId = report.product?.prodId
          formData.value.productName = report.product?.prodName
          formData.value.imageFileName = report.imageFileName
          formData.value.thumbnailUrl = report.thumbnailUrl
          formData.value.user = report.user
          formData.value.comments = report.comments
          formData.value.images = report.images // 기존 이미지 정보 저장

      console.log('report.images:', report.images)
      // 상품 선택 세팅
      if (report.product) {
        selectedProduct.value = report.product
        productSearch.value = report.product.prodName
      }
      // 썸네일 프리뷰 - 기존 이미지가 있으면 표시
      if (report.images && report.images.length > 0 && report.images[0].imageData) {
        thumbnailPreviewUrl.value = `data:image/jpeg;base64,${report.images[0].imageData}`
        console.log('기존 이미지 데이터로 썸네일 프리뷰 설정')
      } else if (report.thumbnailUrl) {
        thumbnailPreviewUrl.value = report.thumbnailUrl.startsWith('http') ? report.thumbnailUrl : `/api/fishing-report/images/${report.thumbnailUrl}`
        console.log('기존 thumbnailUrl로 썸네일 프리뷰 설정')
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

  window.addEventListener('mousedown', handleClickOutside);
})

async function onSubmit() {
  if (!isFormValid.value) {
    const requiredFields = props.editMode ? '제목, 내용, 날짜, 상품' : '제목, 내용, 날짜, 상품, 대표 이미지';
    alert(`필수 항목을 모두 입력해주세요. (${requiredFields})`)
    return
  }
  if (!formData.value.fishingAt) {
    alert('낚시 날짜를 입력하세요.');
    return;
  }

  // 썸네일 필수 검증 (등록 모드에서만)
  if (!props.editMode && !thumbnailFile.value) {
    alert('대표 이미지를 선택해주세요.');
    return;
  }

  // 이미지 파일 검증 (신규 업로드한 파일이 있을 때만)
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
    imageFileName: thumbnailFile.value ? thumbnailFile.value.name : (props.editMode ? formData.value.imageFileName : null),
    product: selectedProduct.value ? {
      prodId: selectedProduct.value.prodId,
      prodName: selectedProduct.value.prodName
    } : null,
    user: report.value && report.value.user
      ? report.value.user
      : (authStore.user ? { userId: authStore.user.userId } : null),
    comments: [],
    thumbnailUrl: props.editMode && !thumbnailFile.value ? formData.value.thumbnailUrl : null,
    // 수정 모드에서 기존 이미지 정보 유지
    images: props.editMode && !thumbnailFile.value && formData.value.images ? formData.value.images : null,
    // 수정 모드에서 기존 이미지 유지 플래그
    keepExistingImage: props.editMode && !thumbnailFile.value && (formData.value.thumbnailUrl || (formData.value.images && formData.value.images.length > 0)) ? true : false,
    // 수정 모드에서 기존 이미지 데이터 직접 포함
    existingImageData: props.editMode && !thumbnailFile.value && formData.value.images && formData.value.images.length > 0 ? formData.value.images[0].imageData : null
  }

  console.log('수정 모드 전송 데이터:', {
    editMode: props.editMode,
    hasThumbnailFile: !!thumbnailFile.value,
    hasExistingImages: !!(formData.value.images && formData.value.images.length > 0),
    dtoToSend: dtoToSend
  })

  try {
    if (props.editMode && props.reportId) {
      // 수정 모드: 수정 API 호출
      // 기존 이미지가 있고 새 파일이 없으면 기존 이미지 데이터를 파일로 변환
      let fileToSend = thumbnailFile.value;
      if (!thumbnailFile.value && formData.value.images && formData.value.images.length > 0 && formData.value.images[0].imageData) {
        console.log('기존 이미지 데이터를 파일로 변환');
        // base64를 Blob으로 변환
        const base64Data = formData.value.images[0].imageData;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        fileToSend = new File([blob], 'existing-image.jpg', { type: 'image/jpeg' });
      }
      
      // FormData로 전송하기 위해 dto에서 불필요한 필드 제거
      const cleanDto = { ...dtoToSend };
      delete cleanDto.existingImageData; // 백엔드에서 처리하지 않는 필드 제거
      delete cleanDto.images; // 백엔드에서 처리하지 않는 필드 제거
      delete cleanDto.keepExistingImage; // 백엔드에서 처리하지 않는 필드 제거
      
      const updateResult = await fishingReportStore.updateFishingReport(props.reportId, cleanDto, fileToSend)
      console.log('수정 API 결과:', updateResult)
      alert('조황정보가 성공적으로 수정되었습니다!')
      
      // 수정 완료 후 잠시 대기 후 상세페이지 새로고침
      setTimeout(async () => {
        console.log('상세페이지 새로고침 시작')
        await fishingReportStore.fetchReportById(props.reportId)
        console.log('상세페이지 새로고침 완료')
        router.push(`/fishing-report/${props.reportId}`)
      }, 1000) // 대기 시간을 1초로 증가
    } else {
      // 등록 모드: 등록 API 호출
      const createdReport = await fishingReportStore.createFishingReport(dtoToSend, thumbnailFile.value)
      alert('조황정보가 성공적으로 등록되었습니다!')
      
      // 등록 성공 후 리스트 새로고침하고 리스트 페이지로 이동
      await fishingReportStore.fetchReports(0, fishingReportStore.pageSize)
      router.push('/fishing-report')
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
      let products = res.data.content || []
      const searchTerm = newVal.toLowerCase()
      products = products.filter(p => p.prodName.toLowerCase().includes(searchTerm))
      // 검색어와의 관련성에 따라 정렬
      productOptions.value = products.sort((a, b) => {
        const aName = a.prodName.toLowerCase()
        const bName = b.prodName.toLowerCase()
        if (aName === searchTerm && bName !== searchTerm) return -1
        if (bName === searchTerm && aName !== searchTerm) return 1
        const aStartsWith = aName.startsWith(searchTerm)
        const bStartsWith = bName.startsWith(searchTerm)
        if (aStartsWith && !bStartsWith) return -1
        if (bStartsWith && !aStartsWith) return 1
        const aIndex = aName.indexOf(searchTerm)
        const bIndex = bName.indexOf(searchTerm)
        if (aIndex !== bIndex) return aIndex - bIndex
        return aName.localeCompare(bName)
      })
    } catch (e) {
      productOptions.value = []
    } finally {
      productSearchLoading.value = false
    }
  } else if (newVal === '') {
    loadAllProducts()
  } else {
    if (productOptions.value.length > 0) {
      const filtered = productOptions.value.filter(product => 
        product.prodName.toLowerCase().includes(newVal.toLowerCase())
      )
      productOptions.value = filtered
    }
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
  window.removeEventListener('mousedown', handleClickOutside);
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
  loadAllProducts();
  showAutocomplete.value = true;
}

function handleClickOutside(event) {
  if (
    autocompleteRef.value &&
    !autocompleteRef.value.contains(event.target) &&
    productInputRef.value &&
    !productInputRef.value.contains(event.target)
  ) {
    showAutocomplete.value = false;
  }
}

// 전체 상품 목록 로드
async function loadAllProducts() {
  try {
    const res = await getProductsByKeyword(''); // 빈 문자열로 전체 상품 조회
    const products = res.data.content || [];
    // 최신 등록순 정렬 (prodId DESC)
    productOptions.value = products.sort((a, b) => b.prodId - a.prodId);
  } catch (e) {
    productOptions.value = [];
  } finally {
    productSearchLoading.value = false;
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
        </div>

        <div class="form-row">
          <div class="form-group" style="position:relative;">
            <label class="form-label required">상품 선택</label>
            <input
                v-model="productSearch"
                type="text"
                class="form-control"
                placeholder="클릭하여 상품을 선택하거나 검색하세요"
                autocomplete="off"
                ref="productInputRef"
                @keydown="onProductInputKeydown"
                @blur="onProductInputBlur"
                @focus="onProductInputFocus"
            />
            <div v-if="productSearchLoading" style="color: #1976d2; font-size: 0.9em;">검색 중...</div>
            <ul v-if="showAutocomplete" class="autocomplete-list" ref="autocompleteRef">
              <li
                  v-for="(option, idx) in productOptions"
                  :key="option.prodId"
                  @mousedown="selectProduct(option)"
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

      <!-- 썸네일 업로드 섹션 -->
              <div class="form-section">
          <h3 class="section-title">📸 대표 이미지 업로드 <span v-if="!editMode" class="required-mark">*</span></h3>
        <div class="image-upload-container">
          <!-- 썸네일 미리보기 -->
          <div v-if="thumbnailFile || (editMode && report && report.images && report.images.length)" class="thumbnail-preview">
            <div class="thumbnail-display">
              <div class="thumbnail-item">
                <img 
                  v-if="thumbnailPreviewUrl" 
                  :src="thumbnailPreviewUrl" 
                  alt="썸네일 미리보기" 
                  class="thumbnail-image" 
                />
                <img 
                  v-else-if="editMode && report && report.images && report.images.length && report.images[0].imageData" 
                  :src="`data:image/jpeg;base64,${report.images[0].imageData}`" 
                  alt="기존 썸네일" 
                  class="thumbnail-image" 
                />
                <img 
                  v-else-if="editMode && report && report.thumbnailUrl" 
                  :src="report.thumbnailUrl.startsWith('http') ? report.thumbnailUrl : `/api/fishing-report/images/${report.thumbnailUrl}`" 
                  alt="기존 썸네일" 
                  class="thumbnail-image" 
                />
                <div class="thumbnail-overlay">
                  <div class="thumbnail-actions">
                    <button 
                      type="button" 
                      @click="removeThumbnail" 
                      class="remove-btn"
                      title="썸네일 삭제"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div class="thumbnail-info">
                  <span class="thumbnail-name">{{ thumbnailFile ? thumbnailFile.name : '기존 이미지' }}</span>
                  <span v-if="thumbnailFile" class="thumbnail-size">{{ (thumbnailFile.size / 1024 / 1024).toFixed(1) }}MB</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 업로드 플레이스홀더 -->
          <div v-else class="upload-placeholder">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <p class="upload-text">조황정보 대표 이미지를 업로드하세요</p>
            <p class="upload-hint">JPG, PNG 파일만 가능합니다 (최대 5MB)</p>
            <p class="upload-hint">대표 이미지는 하나만 업로드 가능합니다</p>
          </div>

          <div class="upload-button-container">
            <input 
              type="file" 
              accept="image/*" 
              @change="onThumbnailChange" 
              class="file-input"
              id="imageUpload"
            />
            <label for="imageUpload" class="upload-label">
              <i class="fas fa-plus"></i>
              {{ thumbnailFile ? '대표 이미지 변경' : '대표 이미지 선택' }}
            </label>
          </div>
        </div>
      </div>

      <!-- 내용 작성 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📝 {{ editMode ? '조황정보 수정' : '조황정보 작성' }}</h3>
        <div class="form-group">
          <label class="form-label required">조황정보 내용</label>
          <RichTextEditor v-model="formData.content" editor-id="fishing-report-editor"/>
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

.required-mark {
  color: #f44336;
  font-weight: 700;
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
  color: #333 !important;
  background-color: #fff !important;
}

.form-control:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-control::placeholder {
  color: #999 !important;
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

/* 썸네일 업로드 스타일 */
.image-upload-container {
  position: relative;
}

.thumbnail-preview {
  margin-bottom: 20px;
}

.thumbnail-display {
  display: flex;
  justify-content: center;
}

.thumbnail-item {
  position: relative;
  max-width: 300px;
  width: 100%;
}

.thumbnail-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.thumbnail-item:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-actions {
  display: flex;
  gap: 5px;
}

.thumbnail-actions button {
  background: rgba(244, 67, 54, 0.9);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.thumbnail-actions button:hover {
  background: rgba(244, 67, 54, 1);
}

.thumbnail-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0 0 8px 8px;
  padding: 8px;
  color: white;
  font-size: 0.9em;
}

.thumbnail-name {
  font-weight: 600;
  display: block;
  margin-bottom: 2px;
}

.thumbnail-size {
  font-size: 0.8em;
  opacity: 0.8;
}

.upload-placeholder {
  text-align: center;
  padding: 40px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  color: #666;
  margin-bottom: 20px;
  background: #fafafa;
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 10px;
  color: #1976d2;
}

.upload-text {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 4px;
}

.file-input {
  display: none;
}

.upload-label {
  background: #1976d2;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.upload-label:hover {
  background: #1565c0;
  transform: translateY(-1px);
}

.upload-button-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.remove-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background: #d32f2f;
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

  .thumbnail-item {
    max-width: 100%;
  }

  .thumbnail-image {
    height: 150px;
  }

  .upload-placeholder {
    padding: 30px 15px;
  }

  .upload-icon {
    font-size: 30px;
  }

  .upload-text {
    font-size: 1rem;
  }

  .upload-hint {
    font-size: 0.8em;
  }

  .upload-label {
    padding: 10px 20px;
    font-size: 14px;
  }
}

.autocomplete-list,
.autocomplete-item {
  color: #222 !important;
  background: #fff !important;
}

.autocomplete-list {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 400px;
  overflow-y: auto;
  position: absolute;
  z-index: 1000;
  width: 100%;
  min-width: 120px;
  left: 0;
  top: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #ddd;
}

.autocomplete-list::-webkit-scrollbar {
  width: 8px;
}

.autocomplete-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.autocomplete-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.autocomplete-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.autocomplete-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item.highlighted,
.autocomplete-item:hover {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.selected-product-info {
  margin-top: 8px;
  color: #222;
  font-size: 0.95em;
}

.selected-product-info strong {
  color: #222;
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

