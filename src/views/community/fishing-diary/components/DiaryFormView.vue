<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/login/loginStore.js'
import { useRouter } from 'vue-router'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { getProductsByKeyword } from '@/api/product.js'
import { useFishingDiaryStore } from '@/store/fishing-center/useFishingDiaryStore.js'

const router = useRouter()
const files = ref([])
const imagePreviews = ref([])
const existingImages = ref([])
const deletedImageNames = ref([])

const formData = ref({
  title: '',
  content: '',
  fishingAt: new Date().toISOString().split('T')[0],
})

const authStore = useAuthStore()
const selectedProduct = ref(null)
const productSearch = ref('')
const productOptions = ref([])
const productSearchLoading = ref(false)
const fishingDiaryStore = useFishingDiaryStore()
const error = ref('')
const dateInputRef = ref(null)
const autocompleteRef = ref(null)
const productInputRef = ref(null)
const showAutocomplete = ref(false)

const props = defineProps({
  editMode: Boolean,
  diaryId: [String, Number]
});

const isFormValid = computed(() => {
  // 썸네일(기존+새로 업로드) 1장 이상 필수
  const hasAnyImage = files.value.length > 0 || existingImages.value.length > 0;
  return (
      formData.value.title &&
      formData.value.content &&
      formData.value.fishingAt &&
      selectedProduct.value &&
      hasAnyImage
  )
})

function onThumbnailChange(event) {
  const uploadedFiles = Array.from(event.target.files)
  // 썸네일이 이미 있으면 기존 썸네일을 교체(덮어쓰기)
  files.value = []
  imagePreviews.value = []

  // [추가] 수정 모드에서 기존 이미지가 있으면 모두 삭제
  if (uploadedFiles.length > 0 && existingImages.value.length > 0) {
    existingImages.value.forEach(img => {
      deletedImageNames.value.push(img.name)
    })
    existingImages.value = []
  }

  if (uploadedFiles.length > 0) {
    const file = uploadedFiles[0] // 첫 번째 파일만 사용
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} 파일이 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.`)
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreviews.value.push({
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
          name: file.name,
          isExisting: false
        })
      }
      reader.readAsDataURL(file)
      files.value.push(file)
    }
  }
}

function removeImage(imageId) {
  const index = imagePreviews.value.findIndex(img => img.id === imageId)
  if (index > -1) {
    const image = imagePreviews.value[index]
    
    // files 배열에서도 제거
    const fileIndex = files.value.findIndex(file => file === image.file)
    if (fileIndex > -1) {
      files.value.splice(fileIndex, 1)
    }
    
    // imagePreviews에서 제거
    imagePreviews.value.splice(index, 1)
  }
}

function removeAllImages() {
  files.value = []
  imagePreviews.value = []
  existingImages.value = []
  deletedImageNames.value = []
}

function removeExistingImage(imageId) {
  const idx = existingImages.value.findIndex(img => img.id === imageId)
  if (idx > -1) {
    const existingImg = existingImages.value[idx]
    deletedImageNames.value.push(existingImg.name)
    existingImages.value.splice(idx, 1)
    
    // files 배열에서도 제거
    const fileIndex = files.value.findIndex(file => file.name === existingImg.name)
    if (fileIndex > -1) {
      files.value.splice(fileIndex, 1)
    }
  }
}

const allPreviews = computed(() => [...existingImages.value, ...imagePreviews.value])

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    alert('로그인이 필요합니다.')
    router.push('/login')
  }
  if (props.editMode && props.diaryId) {
    try {
      const diary = await fishingDiaryStore.fetchDiaryById(props.diaryId)
      const d = fishingDiaryStore.currentDiary || diary
      if (d) {
        formData.value.title = d.title || ''
        formData.value.content = d.content || ''
        formData.value.fishingAt = d.fishingAt ? d.fishingAt.slice(0, 10) : ''
        if (d.product) {
          selectedProduct.value = d.product
          productSearch.value = d.product.prodName || ''
        }
        
        if (d.images && d.images.length > 0) {
          existingImages.value = d.images.map((img, idx) => ({
            id: 'existing-' + idx,
            url: img.imageData ? `data:image/jpeg;base64,${img.imageData}` : 
                 img.image_data ? `data:image/jpeg;base64,${img.image_data}` :
                 img.imageUrl || img.image_url || '/images/no-image.png',
            name: img.imageName || img.image_name || `image_${idx}`,
            isExisting: true,
            originalImage: img // 원본 이미지 데이터 보존
          }))
          
          // 기존 이미지를 files 배열에만 추가 (수정 시 유지하기 위해, 중복 표시 방지)
          existingImages.value.forEach((existingImg, idx) => {
            if (existingImg.originalImage && existingImg.originalImage.imageData) {
              // base64를 File 객체로 변환
              const byteCharacters = atob(existingImg.originalImage.imageData)
              const byteNumbers = new Array(byteCharacters.length)
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
              }
              const byteArray = new Uint8Array(byteNumbers)
              const blob = new Blob([byteArray], { type: 'image/jpeg' })
              const file = new File([blob], existingImg.name, { type: 'image/jpeg' })
              
              // files 배열에만 추가 (imagePreviews에는 추가하지 않음)
              files.value.push(file)
            }
          })
        }
      }
    } catch (e) {
      error.value = '기존 조행기 정보를 불러오지 못했습니다.'
    }
  }
  window.addEventListener('mousedown', handleClickOutside);
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside);
})

async function onSubmit() {
  if (!isFormValid.value) {
    error.value = '필수 항목을 모두 입력해주세요. (상품, 제목, 내용, 방문 날짜)'
    return
  }
  error.value = ''
  
  const dtoToSend = {
    title: formData.value.title,
    content: formData.value.content,
    fishingAt: formData.value.fishingAt,
    product: {
      prodId: selectedProduct.value?.prodId
    },
    deleteImageNames: [...deletedImageNames.value]
  }
  
  console.log('🟡 조행기 등록 - dtoToSend:', dtoToSend)
  console.log('🟡 조행기 등록 - files.value:', files.value)
  console.log('🟡 조행기 등록 - imagePreviews.value:', imagePreviews.value)
  
  try {
    if (props.editMode && props.diaryId) {
      await fishingDiaryStore.updateFishingDiary(props.diaryId, dtoToSend, files.value)
      alert('조행기가 성공적으로 수정되었습니다!')
      router.push(`/fishing-diary/${props.diaryId}`)
    } else {
      await fishingDiaryStore.createFishingDiary(dtoToSend, files.value)
      alert('조행기가 성공적으로 등록되었습니다!')
      await fishingDiaryStore.fetchDiaries(0, fishingDiaryStore.size)
      router.push('/fishing-diary')
    }
  } catch (err) {
    error.value = '조행기 등록/수정에 실패했습니다. 다시 시도해주세요.'
    console.error(err)
  }
}

function resetForm() {
  formData.value = {
    title: '',
    content: '',
    fishingAt: new Date().toISOString().split('T')[0],
  }
  selectedProduct.value = null
  productSearch.value = ''
  files.value = []
  imagePreviews.value = []
  existingImages.value = []
  deletedImageNames.value = []
  error.value = ''
}

watch(productSearch, async (newQuery) => {
  if (newQuery.length > 0) {
    productSearchLoading.value = true
    try {
      const response = await getProductsByKeyword(newQuery)
      let products = response.data.content || []
      const searchTerm = newQuery.toLowerCase()
      products = products.filter(p => p.prodName.toLowerCase().includes(searchTerm))
      // 검색어와의 관련성에 따라 정렬
      productOptions.value = products.sort((a, b) => {
        const aName = a.prodName.toLowerCase()
        const bName = b.prodName.toLowerCase()
        const searchTerm = newQuery.toLowerCase()
        
        // 정확히 일치하는 것을 우선
        if (aName === searchTerm && bName !== searchTerm) return -1
        if (bName === searchTerm && aName !== searchTerm) return 1
        
        // 검색어로 시작하는 것을 우선
        const aStartsWith = aName.startsWith(searchTerm)
        const bStartsWith = bName.startsWith(searchTerm)
        if (aStartsWith && !bStartsWith) return -1
        if (bStartsWith && !aStartsWith) return 1
        
        // 검색어가 포함된 위치에 따라 정렬
        const aIndex = aName.indexOf(searchTerm)
        const bIndex = bName.indexOf(searchTerm)
        if (aIndex !== bIndex) return aIndex - bIndex
        
        // 알파벳 순으로 정렬
        return aName.localeCompare(bName)
      })
    } catch (error) {
      productOptions.value = []
    } finally {
      productSearchLoading.value = false
    }
  } else {
    productOptions.value = []
  }
})

function selectProduct(product) {
  selectedProduct.value = product
  productSearch.value = product.prodName
  productOptions.value = []
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

async function loadAllProducts() {
  try {
    const response = await getProductsByKeyword(''); // 빈 문자열로 전체 상품 조회
    const products = response.data.content || [];
    // 최신 등록순 정렬 (prodId DESC)
    productOptions.value = products.sort((a, b) => b.prodId - a.prodId);
  } catch (e) {
    productOptions.value = [];
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
    productOptions.value = [];
  }
}
</script>

<template>
  <div class="form-container">
    <div class="form-header">
      <h2 class="form-title">✍️ 조행기 작성</h2>
      <p class="form-subtitle">나만의 낚시 경험을 공유해보세요!</p>
    </div>

    <form @submit.prevent="onSubmit">
      <!-- 기본 정보 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📝 기본 정보</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">제목</label>
            <input id="title" v-model="formData.title" type="text" class="form-control" placeholder="조행기 제목을 입력하세요" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">방문 날짜</label>
            <div class="date-input-container">
              <input 
                id="fishing-at" 
                v-model="formData.fishingAt" 
                type="date" 
                class="form-control date-input" 
                required 
                ref="dateInputRef"
                @click="onDateInputClick"
              />
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
              placeholder="상품명을 입력하세요"
              autocomplete="off"
              @input="error = ''"
              @focus="onProductInputFocus"
              ref="productInputRef"
            />
            <div v-if="productSearchLoading" style="color: #1976d2; font-size: 0.9em;">검색 중...</div>
            <ul v-if="productOptions.length > 0" class="autocomplete-list" ref="autocompleteRef">
              <li v-for="product in productOptions" :key="product.prodId"
                  @mousedown="selectProduct(product)"
                  class="autocomplete-item">
                {{ product.prodName }}
              </li>
            </ul>
            <div v-if="selectedProduct" class="selected-product-info">
              선택된 상품: <strong>{{ selectedProduct.prodName }}</strong>
              <button type="button" @click="selectedProduct = null; productSearch = ''" style="margin-left:8px; color:#f44336; background:none; border:none; cursor:pointer;">선택 취소</button>
            </div>
          </div>
        </div>
      </div>
      <!-- 썸네일 업로드 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📸 썸네일 업로드</h3>
        <div class="image-upload-container">
          <!-- 썸네일 미리보기 -->
          <div v-if="allPreviews.length > 0" class="thumbnail-preview">
            <div class="thumbnail-display">
              <div 
                v-for="(image, index) in allPreviews" 
                :key="image.id"
                class="thumbnail-item"
              >
                <img :src="image.url" :alt="image.name" class="thumbnail-image" />
                <div class="thumbnail-overlay">
                  <div class="thumbnail-actions">
                    <button 
                      v-if="image.isExisting"
                      type="button" 
                      @click="removeExistingImage(image.id)" 
                      class="remove-btn"
                      title="기존 썸네일 삭제"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <button 
                      v-else
                      type="button" 
                      @click="removeImage(image.id)" 
                      class="remove-btn"
                      title="썸네일 삭제"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div class="thumbnail-info">
                  <span class="thumbnail-name">{{ image.name }}</span>
                  <span v-if="!image.isExisting" class="thumbnail-size">{{ (image.file.size / 1024 / 1024).toFixed(1) }}MB</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 업로드 플레이스홀더 -->
          <div v-else class="upload-placeholder">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <p class="upload-text">조행기 썸네일을 업로드하세요</p>
            <p class="upload-hint">JPG, PNG 파일만 가능합니다 (최대 5MB)</p>
            <p class="upload-hint">썸네일은 하나만 업로드 가능합니다</p>
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
              {{ imagePreviews.length > 0 ? '썸네일 변경' : '썸네일 선택' }}
            </label>
          </div>
        </div>
      </div>
      <!-- 내용 작성 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📝 상세 내용</h3>
        <div class="form-group">
          <label class="form-label required">조행기 내용</label>
          <RichTextEditor v-model="formData.content" editor-id="fishing-diary-editor" />
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
        <button type="submit" :disabled="!isFormValid" class="btn btn-primary">
          조행기 등록
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

.form-group :deep(.note-editor) {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.form-group :deep(.note-editor:focus-within) {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.file-preview {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
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
}

.autocomplete-list,
.autocomplete-item {
  color: #222 !important;
  background: #fff !important;
}

.autocomplete-item:hover {
  background: #e3f2fd !important;
  color: #1976d2 !important;
}

.selected-product-info {
  margin-top: 8px;
  color: #222;
  font-size: 0.95em;
}

.selected-product-info strong {
  color: #222;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 10px;
}
.btn-edit, .btn-delete {
  padding: 6px 16px;
  border-radius: 4px;
  font-weight: 600;
}
.btn-edit {
  background: #1976d2;
  color: #fff;
  border: none;
}
.btn-delete {
  background: #f44336;
  color: #fff;
  border: none;
}

.files-preview {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.file-name {
  font-size: 0.9em;
}

.remove-all-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-all-btn:hover {
  background: #d32f2f;
}

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

.autocomplete-list {
  max-height: 400px;
  overflow-y: auto;
}
</style> 