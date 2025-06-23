<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/store/login/loginStore.js'
import { useRouter } from 'vue-router'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { getProductsByKeyword } from '@/api/product.js'
import { useFishingDiaryStore } from '@/store/fishing-center/useFishingDiaryStore.js'

const router = useRouter()
const images = ref([])
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

function onFileChange(event) {
  images.value = Array.from(event.target.files)
}

function removeImage(index) {
  images.value.splice(index, 1)
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
    alert('필수 항목을 모두 입력해주세요. (상품, 제목, 내용, 방문 날짜)')
    return
  }

  const submitFormData = new FormData()
  const dtoToSend = {
    title: formData.value.title,
    content: formData.value.content,
    fishingAt: formData.value.fishingAt,
    product: {
      prodId: selectedProduct.value.prodId,
    }
  }
  submitFormData.append('dto', new Blob([JSON.stringify(dtoToSend)], { type: 'application/json' }))
  
  if (thumbnailFile.value) {
    submitFormData.append('images', thumbnailFile.value)
  }
  images.value.forEach(file => {
    submitFormData.append('images', file)
  })

  try {
    // 스토어 액션 이름은 createFishingDiary로 가정합니다.
    await fishingDiaryStore.createFishingDiary(submitFormData) 
    alert('조행기가 성공적으로 등록되었습니다!')
    router.push('/fishing-diary')
  } catch (err) {
    alert('조행기 등록에 실패했습니다. 다시 시도해주세요.')
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
  images.value = []
}

watch(productSearch, async (newQuery) => {
  if (newQuery.length > 0) {
    productSearchLoading.value = true
    try {
      const response = await getProductsByKeyword(newQuery)
      productOptions.value = response.data
    } catch (error) {
      console.error('Error fetching products:', error)
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
  <div class="-form-container">
    <h1 class="form-title">조행기 작성</h1>
    <form @submit.prevent="onSubmit" class="form">
      <!-- 상품 검색 -->
      <div class="form-group product-search-group">
        <label for="product-search">상품 검색</label>
        <input
            id="product-search"
            v-model="productSearch"
            type="text"
            placeholder="후기를 남길 상품을 검색하세요"
            class="form-input"
        />
        <div v-if="productSearchLoading" class="loading-spinner"></div>
        <ul v-if="productOptions.length > 0" class="product-options-list">
          <li
              v-for="product in productOptions"
              :key="product.prodId"
              @click="selectProduct(product)"
          >
            {{ product.prodName }}
          </li>
        </ul>
        <div v-if="selectedProduct" class="selected-product-info">
          선택된 상품: <strong>{{ selectedProduct.prodName }}</strong>
        </div>
      </div>

      <!-- 제목 -->
      <div class="form-group">
        <label for="title">제목</label>
        <input id="title" v-model="formData.title" type="text" placeholder="제목을 입력하세요" class="form-input" />
      </div>

      <!-- 방문 날짜 -->
      <div class="form-group">
        <label for="fishing-at">방문 날짜</label>
        <input id="fishing-at" v-model="formData.fishingAt" type="date" class="form-input" />
      </div>

      <!-- 내용 -->
      <div class="form-group">
        <label>내용</label>
        <RichTextEditor v-model="formData.content" />
      </div>

      <!-- 썸네일 -->
      <div class="form-group">
        <label for="thumbnail-upload">썸네일 이미지</label>
        <input id="thumbnail-upload" type="file" @change="onThumbnailChange" accept="image/*" class="form-input-file" />
        <div v-if="thumbnailFile" class="thumbnail-preview">
          <span>{{ thumbnailFile.name }}</span>
          <button @click="removeThumbnail" type="button" class="remove-btn">&times;</button>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="form-actions">
        <button type="submit" class="submit-btn" :disabled="!isFormValid">등록하기</button>
        <button type="button" @click="resetForm" class="reset-btn">초기화</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-input, .form-input-file {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.product-search-group {
  position: relative;
}

.product-options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  position: absolute;
  background-color: white;
  width: 100%;
  z-index: 10;
}

.product-options-list li {
  padding: 0.5rem;
  cursor: pointer;
}

.product-options-list li:hover {
  background-color: #f0f0f0;
}

.selected-product-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #e9f5ff;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.submit-btn, .reset-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.submit-btn {
  background-color: #007bff;
}

.submit-btn:disabled {
  background-color: #ccc;
}

.reset-btn {
  background-color: #6c757d;
}

.thumbnail-preview, .image-preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #dc3545;
}
</style> 