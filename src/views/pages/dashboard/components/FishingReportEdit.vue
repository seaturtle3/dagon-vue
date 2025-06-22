<template>
  <div class="fishing-report-edit">
    <div class="header">
      <h2>조황정보 수정</h2>
      <div class="header-actions">
        <button @click="goBack" class="btn-back">
          <i class="fas fa-arrow-left"></i> 목록으로
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> 로딩 중...
    </div>

    <div v-else-if="!report" class="error">
      조황정보를 찾을 수 없습니다.
    </div>

    <div v-else class="edit-form">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h3>기본 정보</h3>
          
          <div class="form-group">
            <label for="title">제목 *</label>
            <input 
              id="title"
              v-model="formData.title" 
              type="text" 
              required
              placeholder="조황정보 제목을 입력하세요"
            >
          </div>

          <div class="form-group">
            <label for="content">내용 *</label>
            <RichTextEditor 
              v-model="formData.content"
              editor-id="fishing-report-edit-editor"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="fishingAt">낚시 날짜 *</label>
              <input 
                id="fishingAt"
                v-model="formData.fishingAt" 
                type="date" 
                required
              >
            </div>

            <div class="form-group">
              <label for="location">위치</label>
              <input 
                id="location"
                v-model="formData.location" 
                type="text" 
                placeholder="낚시 위치"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="weather">날씨</label>
              <select id="weather" v-model="formData.weather">
                <option value="">날씨 선택</option>
                <option value="맑음">맑음</option>
                <option value="흐림">흐림</option>
                <option value="비">비</option>
                <option value="눈">눈</option>
                <option value="안개">안개</option>
              </select>
            </div>

            <div class="form-group">
              <label for="temperature">기온 (°C)</label>
              <input 
                id="temperature"
                v-model="formData.temperature" 
                type="number" 
                placeholder="기온"
              >
            </div>

            <div class="form-group">
              <label for="waterTemperature">수온 (°C)</label>
              <input 
                id="waterTemperature"
                v-model="formData.waterTemperature" 
                type="number" 
                placeholder="수온"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="fishingMethod">낚시 방법</label>
              <input 
                id="fishingMethod"
                v-model="formData.fishingMethod" 
                type="text" 
                placeholder="낚시 방법"
              >
            </div>

            <div class="form-group">
              <label for="catchInfo">어획 정보</label>
              <input 
                id="catchInfo"
                v-model="formData.catchInfo" 
                type="text" 
                placeholder="어획 정보"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="productId">연관 상품</label>
            <select id="productId" v-model="formData.productId">
              <option value="">상품 선택</option>
              <option v-for="product in products" :key="product.prodId" :value="product.prodId">
                {{ product.prodName }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>이미지 관리</h3>
          
          <div class="current-images" v-if="report.images && report.images.length > 0">
            <h4>현재 이미지</h4>
            <div class="image-grid">
              <div v-for="image in report.images" :key="image.id" class="image-item">
                <img :src="image.imageUrl" :alt="image.imageName">
                <div class="image-actions">
                  <button type="button" @click="deleteImage(image.id)" class="btn-delete-image">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="new-images">
            <h4>새 이미지 추가</h4>
            <div class="image-upload">
              <input 
                ref="imageInput"
                type="file" 
                multiple 
                accept="image/*"
                @change="handleImageUpload"
                style="display: none"
              >
              <button type="button" @click="$refs.imageInput.click()" class="btn-upload">
                <i class="fas fa-plus"></i> 이미지 추가
              </button>
            </div>

            <div class="uploaded-images" v-if="newImages.length > 0">
              <div class="image-grid">
                <div v-for="(image, index) in newImages" :key="index" class="image-item">
                  <img :src="URL.createObjectURL(image)" :alt="image.name">
                  <div class="image-actions">
                    <button type="button" @click="removeNewImage(index)" class="btn-delete-image">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="btn-cancel">취소</button>
          <button type="submit" :disabled="submitting" class="btn-submit">
            <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
            {{ submitting ? '수정 중...' : '수정 완료' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/lib/axios'
import RichTextEditor from '@/components/common/RichTextEditor.vue'

const route = useRoute()
const router = useRouter()

// 상태 관리
const loading = ref(false)
const submitting = ref(false)
const report = ref(null)
const products = ref([])
const newImages = ref([])

// 폼 데이터
const formData = reactive({
  title: '',
  content: '',
  fishingAt: '',
  location: '',
  weather: '',
  temperature: '',
  waterTemperature: '',
  fishingMethod: '',
  catchInfo: '',
  productId: null
})

// 메서드
const loadReport = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }

    const response = await axios.get(`/api/fishing-report/get/${route.params.frId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    report.value = response.data
    
    // 폼 데이터 설정
    Object.assign(formData, {
      title: report.value.title || '',
      content: report.value.content || '',
      fishingAt: report.value.fishingAt || '',
      location: report.value.location || '',
      weather: report.value.weather || '',
      temperature: report.value.temperature || '',
      waterTemperature: report.value.waterTemperature || '',
      fishingMethod: report.value.fishingMethod || '',
      catchInfo: report.value.catchInfo || '',
      productId: report.value.product?.prodId || null
    })

  } catch (error) {
    console.error('조황정보 로드 실패:', error)
    alert('조황정보를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const loadProducts = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get('/api/product/get-all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    products.value = response.data || []
  } catch (error) {
    console.error('상품 목록 로드 실패:', error)
  }
}

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  newImages.value.push(...files)
}

const removeNewImage = (index) => {
  newImages.value.splice(index, 1)
}

const deleteImage = async (imageId) => {
  if (!confirm('이 이미지를 삭제하시겠습니까?')) return

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }

    await axios.delete(`/api/fishing-report/image/${imageId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // 이미지 목록에서 제거
    report.value.images = report.value.images.filter(img => img.id !== imageId)
    alert('이미지가 삭제되었습니다.')
  } catch (error) {
    console.error('이미지 삭제 실패:', error)
    alert('이미지 삭제에 실패했습니다.')
  }
}

const handleSubmit = async () => {
  if (!formData.title || !formData.content || !formData.fishingAt) {
    alert('필수 항목을 모두 입력해주세요.')
    return
  }

  submitting.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }

    const submitData = new FormData()
    
    // DTO 데이터
    const dtoData = {
      title: formData.title,
      content: formData.content,
      fishingAt: formData.fishingAt,
      location: formData.location,
      weather: formData.weather,
      temperature: formData.temperature,
      waterTemperature: formData.waterTemperature,
      fishingMethod: formData.fishingMethod,
      catchInfo: formData.catchInfo,
      product: formData.productId ? { prodId: formData.productId } : null
    }

    submitData.append('dto', new Blob([JSON.stringify(dtoData)], { 
      type: 'application/json' 
    }))

    // 새 이미지들 추가
    newImages.value.forEach(file => {
      submitData.append('images', file)
    })

    await axios.put(`/api/fishing-report/update/${route.params.frId}`, submitData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })

    alert('조황정보가 수정되었습니다.')
    router.push('/admin/fishing-reports')
  } catch (error) {
    console.error('조황정보 수정 실패:', error)
    alert('조황정보 수정에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/admin/fishing-reports')
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadReport()
  loadProducts()
})
</script>

<style scoped>
.fishing-report-edit {
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back:hover {
  background: #7f8c8d;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.edit-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* RichTextEditor 스타일 조정 */
.form-group :deep(.note-editor) {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group :deep(.note-editor:focus-within) {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.btn-delete-image {
  background: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete-image:hover {
  background: rgba(231, 76, 60, 1);
}

.image-upload {
  margin-bottom: 1rem;
}

.btn-upload {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-upload:hover {
  background: #2980b9;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-submit {
  background: #27ae60;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #229954;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
