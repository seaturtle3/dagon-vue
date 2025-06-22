<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/lib/axios.js'
import { useAdminAuthStore } from '@/store/auth/auth.js'
import { useAuthStore } from '@/store/login/loginStore.js'
import { useRouter } from 'vue-router'
import RichTextEditor from '@/components/common/RichTextEditor.vue'

const props = defineProps({
  dto: Object,
  loading: Boolean,
  error: String,
})

const emit = defineEmits(['thumbnail-change', 'file-change', 'submit-success', 'submit-error'])

const router = useRouter()
const images = ref([])
const thumbnailFile = ref(null)
const formData = ref({
  title: '',
  content: '',
  fishingAt: '',
  location: '',
  weather: '',
  temperature: '',
  waterTemperature: '',
  fishingMethod: '',
  catchInfo: '',
  productId: null,
  productName: '',
  imageFileName: '',
  thumbnailUrl: '',
  images: [],
  user: null,
  comments: []
})

const adminAuthStore = useAdminAuthStore()
const authStore = useAuthStore()

// 날씨 옵션
const weatherOptions = [
  { value: 'SUNNY', label: '맑음' },
  { value: 'CLOUDY', label: '흐림' },
  { value: 'RAINY', label: '비' },
  { value: 'SNOWY', label: '눈' },
  { value: 'WINDY', label: '바람' }
]

// 낚시 방법 옵션
const fishingMethodOptions = [
  { value: 'ROD', label: '대물낚시' },
  { value: 'SPINNING', label: '스피닝' },
  { value: 'FLY', label: '플라이낚시' },
  { value: 'NET', label: '그물' },
  { value: 'TRAP', label: '통발' }
]

// 어종 옵션
const fishSpeciesOptions = [
  { value: 'BASS', label: '배스' },
  { value: 'CRAPPIE', label: '블루길' },
  { value: 'CATFISH', label: '메기' },
  { value: 'CARP', label: '잉어' },
  { value: 'TROUT', label: '송어' },
  { value: 'SALMON', label: '연어' },
  { value: 'OTHER', label: '기타' }
]

const isFormValid = computed(() => {
  return formData.value.title && 
         formData.value.content && 
         formData.value.fishingAt &&
         formData.value.location
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
  console.log('axios headers:', axios.defaults.headers.common['Authorization'])
  console.log('adminAuthStore token:', adminAuthStore.token)
  console.log('adminAuthStore isAuthenticated:', adminAuthStore.isAuthenticated)
  console.log('authStore isAuthenticated:', authStore.isAuthenticated)
  console.log('========================')
}

function onThumbnailChange(event) {
  const file = event.target.files[0]
  if (file) {
    thumbnailFile.value = file
    emit('thumbnail-change', event)
  }
}

function onFileChange(event) {
  const files = Array.from(event.target.files)
  images.value = files
  emit('file-change', event)
}

function removeImage(index) {
  images.value.splice(index, 1)
}

function removeThumbnail() {
  thumbnailFile.value = null
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
})

async function onSubmit() {
  if (!isFormValid.value) {
    alert('필수 항목을 모두 입력해주세요.')
    return
  }

  // 이미지 필수 검증 (백엔드 요구사항)
  if (images.value.length === 0) {
    alert('이미지는 최소 1장 이상 업로드해주세요.')
    return
  }

  // 제출 전 토큰 재검증
  const tokenValid = await validateAndRefreshToken()
  if (!tokenValid) {
    return
  }

  try {
    const submitFormData = new FormData()

    // DTO 데이터 준비 (백엔드에서 @RequestPart("dto")로 직접 받음)
    const dtoToSend = {
      title: formData.value.title,
      content: formData.value.content,
      fishingAt: formData.value.fishingAt,
      location: formData.value.location,
      weather: formData.value.weather,
      temperature: formData.value.temperature,
      waterTemperature: formData.value.waterTemperature,
      fishingMethod: formData.value.fishingMethod,
      catchInfo: formData.value.catchInfo,
      product: formData.value.productId ? { prodId: formData.value.productId } : null,
      prodName: formData.value.productName || null,
      imageFileName: null,
      thumbnailUrl: null,
      images: [],
      user: null,
      comments: []
    }

    console.log('전송할 조황정보 데이터:', dtoToSend)
    
    // @RequestPart("dto")에 맞게 DTO 객체 추가 (JSON Blob이 아닌 직접 객체)
    submitFormData.append('dto', new Blob([JSON.stringify(dtoToSend)], { 
      type: 'application/json' 
    }))

    // @RequestPart("images")에 맞게 이미지들 추가 (썸네일 + 추가 이미지 모두 포함)
    const allImages = []
    
    // 썸네일이 있으면 추가
    if (thumbnailFile.value) {
      allImages.push(thumbnailFile.value)
    }
    
    // 추가 이미지들 추가
    allImages.push(...images.value)
    
    // 모든 이미지를 images 파트에 추가
    allImages.forEach(file => {
      submitFormData.append('images', file)
    })

    // FormData 내용 확인 (디버깅용)
    console.log('FormData 내용:')
    for (let [key, value] of submitFormData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, value.name, value.type, value.size)
      } else {
        console.log(`${key}:`, value)
      }
    }

    // 현재 유효한 토큰 가져오기
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('로그인 토큰이 없습니다.')
    }

    const res = await axios.post('/api/fishing-report/create', submitFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('조황정보 등록 성공:', res.data)
    alert('조황정보가 성공적으로 등록되었습니다!')
    
    // 조황정보 목록 페이지로 이동
    router.push('/fishing-report')
    
    emit('submit-success', res.data)
  } catch (err) {
    console.error('조황정보 등록 실패:', err)
    
    // 백엔드 에러 메시지 처리
    if (err.response?.data) {
      const errorMessage = err.response.data
      if (typeof errorMessage === 'string') {
        alert(`등록 실패: ${errorMessage}`)
        return
      }
    }
    
    // JWT 관련 오류 처리
    if (err.response?.status === 401 || err.response?.status === 500) {
      const errorMessage = err.response?.data?.message || err.message
      if (errorMessage.includes('JWT') || errorMessage.includes('signature')) {
        console.log('JWT 서명 오류 감지')
        
        // 토큰을 초기화하지 않고 사용자에게 알림
        alert('인증에 문제가 있습니다. 페이지를 새로고침하거나 다시 로그인해주세요.')
        return
      }
    }
    
    alert('조황정보 등록에 실패했습니다. 다시 시도해주세요.')
    emit('submit-error', err)
  }
}

function resetForm() {
  formData.value = {
    title: '',
    content: '',
    fishingAt: '',
    location: '',
    weather: '',
    temperature: '',
    waterTemperature: '',
    fishingMethod: '',
    catchInfo: '',
    productId: null,
    productName: '',
    imageFileName: '',
    thumbnailUrl: '',
    images: [],
    user: null,
    comments: []
  }
  images.value = []
  thumbnailFile.value = null
  // RichTextEditor는 v-model로 자동으로 초기화됩니다
}
</script>

<template>
  <div class="report-form-container">
    <div class="form-header">
      <h2 class="form-title">🎣 조황정보 등록</h2>
      <p class="form-subtitle">오늘의 낚시 조황을 공유해보세요!</p>
    </div>

    <form @submit.prevent="onSubmit" class="report-form">
      <!-- 기본 정보 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📝 기본 정보</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">제목</label>
            <input 
              v-model="formData.title" 
              type="text" 
              class="form-control" 
              placeholder="조황정보 제목을 입력하세요"
              required 
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">낚시 날짜</label>
            <input 
              v-model="formData.fishingAt" 
              type="date" 
              class="form-control" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label required">낚시 장소</label>
            <input 
              v-model="formData.location" 
              type="text" 
              class="form-control" 
              placeholder="낚시한 장소를 입력하세요"
              required 
            />
          </div>
        </div>
      </div>

      <!-- 날씨 정보 섹션 -->
      <div class="form-section">
        <h3 class="section-title">🌤️ 날씨 정보</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">날씨</label>
            <select v-model="formData.weather" class="form-control">
              <option value="">날씨를 선택하세요</option>
              <option v-for="option in weatherOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">기온 (°C)</label>
            <input 
              v-model="formData.temperature" 
              type="number" 
              class="form-control" 
              placeholder="기온을 입력하세요"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">수온 (°C)</label>
            <input 
              v-model="formData.waterTemperature" 
              type="number" 
              class="form-control" 
              placeholder="수온을 입력하세요"
            />
          </div>
        </div>
      </div>

      <!-- 낚시 정보 섹션 -->
      <div class="form-section">
        <h3 class="section-title">🎯 낚시 정보</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">낚시 방법</label>
            <select v-model="formData.fishingMethod" class="form-control">
              <option value="">낚시 방법을 선택하세요</option>
              <option v-for="option in fishingMethodOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">어종</label>
            <select v-model="formData.catchInfo" class="form-control">
              <option value="">잡은 어종을 선택하세요</option>
              <option v-for="option in fishSpeciesOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 이미지 업로드 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📸 이미지 업로드</h3>
        
        <div class="form-group">
          <label class="form-label">대표 썸네일</label>
          <input 
            type="file" 
            accept="image/*" 
            class="form-control" 
            @change="onThumbnailChange" 
          />
          <div v-if="thumbnailFile" class="file-preview">
            <span>선택된 파일: {{ thumbnailFile.name }}</span>
            <button type="button" @click="removeThumbnail" class="remove-btn">삭제</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">추가 이미지</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            class="form-control" 
            @change="onFileChange" 
          />
          <div v-if="images.length > 0" class="file-list">
            <div v-for="(file, index) in images" :key="index" class="file-item">
              <span>{{ file.name }}</span>
              <button type="button" @click="removeImage(index)" class="remove-btn">삭제</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 내용 작성 섹션 -->
      <div class="form-section">
        <h3 class="section-title">📝 상세 내용</h3>
        
        <div class="form-group">
          <label class="form-label required">조황정보 내용</label>
          <RichTextEditor 
            v-model="formData.content"
            editor-id="fishing-report-editor"
          />
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

.file-preview, .file-list {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
}

.file-item:last-child {
  border-bottom: none;
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
</style>
