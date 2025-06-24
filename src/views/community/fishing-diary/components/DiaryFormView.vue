<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/store/login/loginStore.js'
import { useRouter } from 'vue-router'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { getProductsByKeyword } from '@/api/product.js'
import { useFishingDiaryStore } from '@/store/fishing-center/useFishingDiaryStore.js'

const router = useRouter()
const thumbnailFile = ref(null)
const formData = ref({
  title: '',
  content: '',
  fishingAt: '',
})

const authStore = useAuthStore()
const selectedProduct = ref(null)
const productSearch = ref('')
const productOptions = ref([])
const productSearchLoading = ref(false)
const fishingDiaryStore = useFishingDiaryStore()
const error = ref('')

const isFormValid = computed(() => {
  return (
      formData.value.title &&
      formData.value.content &&
      formData.value.fishingAt &&
      selectedProduct.value
  )
})

function onThumbnailChange(event) {
  const file = event.target.files[0]
  if (file) {
    thumbnailFile.value = file
  }
}

function removeThumbnail() {
  thumbnailFile.value = null
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    alert('로그인이 필요합니다.')
    router.push('/login')
  }
})

async function onSubmit() {
  if (!isFormValid.value) {
    error.value = '필수 항목을 모두 입력해주세요. (상품, 제목, 내용, 방문 날짜)'
    return
  }
  error.value = ''
  const submitFormData = new FormData()
  submitFormData.append(
    'dto',
    new Blob([
      JSON.stringify({
        title: formData.value.title,
        content: formData.value.content,
        fishingAt: formData.value.fishingAt, // yyyy-MM-dd
        product: {
          prodId: selectedProduct.value?.prodId
        }
      })
    ], { type: 'application/json' })
  )
  if (thumbnailFile.value) {
    submitFormData.append('images', thumbnailFile.value)
  }
  // 디버깅: FormData 내용 확인
  for (let pair of submitFormData.entries()) {
    console.log(pair[0], pair[1]);
  }
  try {
    await fishingDiaryStore.createFishingDiary(submitFormData) 
    alert('조행기가 성공적으로 등록되었습니다!')
    router.push('/fishing-diary')
  } catch (err) {
    error.value = '조행기 등록에 실패했습니다. 다시 시도해주세요.'
    console.error(err)
  }
}

function resetForm() {
  formData.value = {
    title: '',
    content: '',
    fishingAt: '',
  }
  selectedProduct.value = null
  productSearch.value = ''
  thumbnailFile.value = null
  error.value = ''
}

watch(productSearch, async (newQuery) => {
  if (newQuery.length > 0) {
    productSearchLoading.value = true
    try {
      const response = await getProductsByKeyword(newQuery)
      productOptions.value = response.data.content || []
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
</script>

<template>
  <div class="report-form-container">
    <div class="form-header">
      <h2 class="form-title">✍️ 조행기 작성</h2>
      <p class="form-subtitle">나만의 낚시 경험을 공유해보세요!</p>
    </div>

    <form @submit.prevent="onSubmit" class="report-form">
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
            <input id="fishing-at" v-model="formData.fishingAt" type="date" class="form-control" required />
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
            />
            <div v-if="productSearchLoading" style="color: #1976d2; font-size: 0.9em;">검색 중...</div>
            <ul v-if="productOptions.length > 0" class="autocomplete-list">
              <li v-for="product in productOptions" :key="product.prodId"
                  @mousedown.prevent="selectProduct(product)"
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
      <!-- 이미지 업로드 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📸 이미지 업로드</h3>
        <div class="form-group">
          <label class="form-label">대표 썸네일</label>
          <input id="thumbnail-upload" type="file" @change="onThumbnailChange" accept="image/*" class="form-control" />
          <div v-if="thumbnailFile" class="file-preview">
            <span>{{ thumbnailFile.name }}</span>
            <button @click="removeThumbnail" type="button" class="remove-btn">삭제</button>
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
.report-form-container {
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
.autocomplete-item.highlighted, .autocomplete-item:hover {
  background: #e3f2fd;
}
.selected-product-info {
  margin-top: 8px;
  color: #1976d2;
  font-size: 0.95em;
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
</style> 