<script setup>
import {reactive, watch, toRefs, onMounted, ref, computed} from 'vue'
import { useRouter } from 'vue-router'
import { useProductFormStore } from '@/store/product/all-products/useProductFormStore'

const productFormStore = useProductFormStore()
import { createProduct, updateProduct } from "@/api/product.js";
import {BASE_URL} from "@/constants/baseUrl.js";

const router = useRouter()
const files = ref([])  // 여러 파일 업로드 지원
const imagePreviews = ref([]) // 여러 이미지 미리보기

const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  regions: Array,
  mainTypes: Array,
  subTypes: Array,
  editMode: Boolean,
  // prodId: [String, Number]
})

onMounted(() => {
  console.log('✅ editMode:', props.editMode)
  console.log('✅ form.prodId:', props.form?.prodId)
})

const localForm = reactive({
  prodName: '',
  prodRegion: '',
  mainType: '',
  subType: '',
  maxPerson: 0,
  minPerson: 0,
  weight: 0,
  prodAddress: '',
  prodDescription: '',
  prodNotice: '',
  prodEvent: '',
  prodImageNames: [],
})

// props.form이 바뀔 때마다 localForm에 반영 (초기 진입 포함)
watch(
    () => props.form,
    (newForm) => {
      if (props.editMode && newForm) {
        Object.assign(localForm, newForm);
      }
    },
    { immediate: true }
)

// 기존 이미지 미리보기용 배열
const existingImages = ref([])

watch(
    () => props.form.prodImageNames,
    (newVal) => {
      if (newVal && newVal.length > 0) {
        existingImages.value = newVal.map((imgPath, idx) => ({
          id: 'existing-' + idx,
          url: BASE_URL + imgPath,
          isExisting: true,
        }))
      } else {
        existingImages.value = []
      }
    },
    { immediate: true }
)

const islocalFormValid = computed(() => {
  return (
      localForm.prodName &&
      localForm.prodRegion &&
      localForm.mainType &&
      localForm.subType &&
      localForm.maxPerson &&
      localForm.weight &&
      localForm.prodAddress &&
    files.value.length > 0
  )
})


const allPreviews = computed(() => [...existingImages.value, ...imagePreviews.value])

function onFileChange(event) {
  const uploadedFiles = Array.from(event.target.files)

  uploadedFiles.forEach(file => {
    if (file && file.type.startsWith('image/')) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} 파일이 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.`)
        return
      }

      // 이미지 미리보기 생성
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreviews.value.push({
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
          name: file.name
        })
      }
      reader.readAsDataURL(file)

      files.value.push(file)
    }
  })
}

// 기존 이미지 삭제
const deletedImageNames = ref([])

function removeExistingImage(index) {
  const removed = localForm.prodImageNames.splice(index, 1)[0]
  if (removed) {
    deletedImageNames.value.push(removed)
  }
}

// 새로 추가된 이미지 삭제
function removeImage(imageId) {
  const index = imagePreviews.value.findIndex(img => img.id === imageId)
  if (index > -1) {
    imagePreviews.value.splice(index, 1)
    files.value.splice(index, 1)
  }
}

function removeAllImages() {
  files.value = []
  imagePreviews.value = []
}

async function submit() {
  if (!islocalFormValid.value) {
    alert("필수 항목을 모두 입력해주세요.")
    return
  }

  const dtoToSend = {
    prodName: localForm.prodName,
    prodRegion: localForm.prodRegion,
    mainType: localForm.mainType,
    subType: localForm.subType,
    maxPerson: localForm.maxPerson,
    minPerson: localForm.minPerson,
    weight: localForm.weight,
    prodAddress: localForm.prodAddress,
    prodDescription: localForm.prodDescription,
    prodNotice: localForm.prodNotice,
    prodEvent: localForm.prodEvent,
    deletedImageNames: deletedImageNames.value // 서버에 삭제할 이미지 이름 전달
  }

  try {
    if (props.editMode && props.form?.prodId) {
      await productFormStore.updateProductAction(
          props.form.prodId,
          dtoToSend,
          files.value,
          router
      )
    } else {
      await productFormStore.createProductAction(dtoToSend, files.value, router)
    }
    await router.push('/partner/products')
  } catch (err) {
    console.error('제품정보 등록/수정 실패:', err)
    if (err.response?.data?.message) {
      alert(`제품정보 등록/수정 실패: ${err.response.data.message}`)
    } else if (err.response?.status === 500) {
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else {
      alert('제품정보 등록/수정에 실패했습니다. 다시 시도해주세요.')
    }
  }
}

const filteredSubTypes = computed(() => {
  return props.subTypes.filter(sub => sub.mainType === localForm.mainType)
})

</script>

<template>
  <div class="product-form-container">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1 class="page-title">{{ props.editMode ? '선박 상품 수정' : '선박 상품 등록' }}</h1>
      <p class="page-subtitle">{{ props.editMode ? '선박 상품 정보를 수정합니다' : '새로운 선박 상품을 등록해보세요' }}</p>
    </div>

    <form @submit.prevent="submit" class="product-form">
      <!-- 메인 정보 섹션 -->
      <div class="form-main-section">
        <!-- 이미지 업로드 영역 -->
        <div class="image-upload-section">
          <div class="upload-container">

            <div v-if="allPreviews.length > 0" class="image-gallery">
              <div class="gallery-header">
                <h4 class="gallery-title">
                  <i class="fas fa-images"></i>
                  업로드된 이미지 ({{ allPreviews.length }}장)
                </h4>
                <button type="button" @click="removeAllImages" class="clear-all-btn">
                  <i class="fas fa-trash"></i>
                  모두 삭제
                </button>
              </div>

              <div class="gallery-grid">
                <div
                    v-for="(image, index) in allPreviews"
                    :key="image.id"
                    class="gallery-item"
                    :class="{ 'main-image': index === 0 }"
                >
                  <img :src="image.url" :alt="image.name" class="gallery-image" />
                  <div class="image-overlay">
                    <div class="image-actions">
                      <button
                          v-if="image.isExisting"
                          type="button"
                          @click="removeExistingImage(image.id)"
                          class="remove-btn"
                          title="기존 이미지 삭제"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                      <button
                          v-else
                          type="button"
                          @click="removeImage(image.id)"
                          class="remove-btn"
                          title="이미지 삭제"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <div v-if="index === 0" class="main-badge">
                      <i class="fas fa-star"></i>
                      대표
                    </div>
                  </div>
                  <!-- 이미지 이름, 용량 표시 등 기존 코드 유지 -->
                </div>
              </div>
            </div>


            <!-- 업로드 플레이스홀더 -->
            <div v-else class="upload-placeholder">
              <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
              </div>
              <p class="upload-text">대표 이미지를 업로드하세요</p>
              <p class="upload-hint">JPG, PNG 파일만 가능합니다 (최대 5MB)</p>
              <p class="upload-hint">여러 장 업로드 가능 (첫 번째가 대표 이미지)</p>
              <p class="upload-hint required-text">* 필수 항목입니다</p>
            </div>

            <input
              type="file"
              accept="image/*"
              @change="onFileChange"
              class="file-input"
              id="imageUpload"
              multiple
            />
            <label for="imageUpload" class="upload-label">
              <i class="fas fa-plus"></i>
              {{ imagePreviews.length > 0 ? '이미지 추가' : '이미지 선택' }}
            </label>
          </div>
        </div>

        <!-- 기본 정보 영역 -->
        <div class="basic-info-section">
          <div class="section-header">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              기본 정보
            </h3>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">배 이름</label>
              <input
                v-model="localForm.prodName"
                type="text"
                class="form-input"
                placeholder="배 이름을 입력하세요"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label required">지역</label>
              <select v-model="localForm.prodRegion" class="form-select">
                <option v-for="region in regions" :key="region.name" :value="region.name">
                  {{ region.korean }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">바다/민물 유형</label>
              <select v-model="localForm.mainType" class="form-select">
                <option v-for="type in mainTypes" :key="type.name" :value="type.name">
                  {{ type.korean }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">상세 장소</label>
              <select v-model="localForm.subType" class="form-select">
                <option v-for="sub in filteredSubTypes" :key="sub.name" :value="sub.name">
                  {{ sub.korean }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">최대 인원</label>
              <input
                v-model.number="localForm.maxPerson"
                type="number"
                class="form-input"
                placeholder="최대 수용 인원"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">최소 인원</label>
              <input
                v-model.number="localForm.minPerson"
                type="number"
                class="form-input"
                placeholder="최소 필요 인원 (선택사항)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 배 상세 정보 섹션 -->
      <div class="boat-detail-section">
        <div class="section-header">
          <h3 class="section-title">
            <i class="fas fa-ship"></i>
            배 상세 정보
          </h3>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">선박 무게</label>
            <input
              v-model.number="localForm.weight"
              step="0.01"
              type="number"
              class="form-input"
              placeholder="선박 무게 (t)"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label required">선박 주소</label>
            <input
              v-model="localForm.prodAddress"
              type="text"
              class="form-input"
              placeholder="선박이 위치한 주소"
              required
            />
          </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">상세 설명</label>
          <textarea
            v-model="localForm.prodDescription"
            class="form-textarea"
            placeholder="선박에 대한 상세한 설명을 입력하세요"
            rows="4"
          ></textarea>
        </div>
      </div>

      <!-- 추가 정보 섹션 -->
      <div class="additional-info-section">
        <div class="section-header">
          <h3 class="section-title">
            <i class="fas fa-plus-circle"></i>
            추가 정보
          </h3>
        </div>

        <div class="form-group full-width">
          <label class="form-label">공지 사항</label>
          <textarea
              v-model="localForm.prodNotice"
              class="form-textarea"
              placeholder="고객에게 알려야 할 중요한 공지사항을 입력하세요"
              rows="3"
          ></textarea>
        </div>

        <div class="form-group full-width">
          <label class="form-label">이벤트</label>
          <textarea
            v-model="localForm.prodEvent"
            class="form-textarea"
            placeholder="진행 중인 이벤트나 특별한 혜택이 있다면 입력하세요"
            rows="3"
          ></textarea>
        </div>

      </div>

      <!-- 제출/수정 버튼 -->
      <div class="form-actions">
        <button
            type="submit"
            :disabled="!islocalFormValid"
            class="submit-button"
        >
          <i class="fas fa-save"></i>
          {{ props.editMode ? '상품 수정' : '상품 등록' }}
        </button>
      </div>

    </form>
  </div>
</template>

<style scoped>
.product-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 페이지 헤더 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

/* 폼 레이아웃 */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 메인 섹션 */
.form-main-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* 이미지 업로드 섹션 */
.image-upload-section {
  padding: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  min-height: 500px;
}

.upload-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.upload-placeholder {
  border: 3px dashed #cbd5e0;
  border-radius: 12px;
  padding: 60px 20px;
  background: white;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: #4299e1;
  background: #f7fafc;
}

.upload-icon {
  font-size: 3rem;
  color: #cbd5e0;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 0.9rem;
  color: #718096;
  margin: 4px 0;
}

.upload-hint.required-text {
  color: #e53e3e;
  font-weight: 600;
  margin-top: 8px;
}

/* 이미지 갤러리 */
.image-gallery {
  width: 100%;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.gallery-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.gallery-title i {
  color: #4299e1;
}

.clear-all-btn {
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;
}

.clear-all-btn:hover {
  background: #c53030;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: white;
  transition: transform 0.2s;
}

.gallery-item:hover {
  transform: translateY(-2px);
}

.gallery-item.main-image {
  border: 3px solid #4299e1;
}

.gallery-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
}

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  justify-content: flex-end;
}

.remove-btn {
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: rgba(220, 38, 38, 1);
}

.main-badge {
  background: rgba(66, 153, 225, 0.9);
  color: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
}

.image-info {
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 6px 8px;
  font-size: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.image-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  opacity: 0.8;
}

.file-input {
  display: none;
}

.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.upload-label:hover {
  background: linear-gradient(135deg, #3182ce, #2c5282);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

/* 기본 정보 섹션 */
.basic-info-section {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title i {
  color: #4299e1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-label.required::after {
  content: ' *';
  color: #e53e3e;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  border-color: #4299e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-textarea {
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  background: white;
}

.form-textarea:focus {
  border-color: #4299e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

/* 배 상세 정보 섹션 */
.boat-detail-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.boat-detail-section .section-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 24px 32px;
  color: white;
}

.boat-detail-section .section-title {
  color: white;
  margin: 0;
}

.boat-detail-section .section-title i {
  color: white;
}

.boat-detail-section .form-grid {
  padding: 32px;
  margin-bottom: 0;
}

.boat-detail-section .form-group.full-width {
  padding: 0 32px 32px;
}

/* 추가 정보 섹션 */
.additional-info-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.additional-info-section .section-header {
  background: linear-gradient(135deg, #48bb78, #38a169);
  padding: 24px 32px;
  color: white;
}

.additional-info-section .section-title {
  color: white;
  margin: 0;
}

.additional-info-section .section-title i {
  color: white;
}

.additional-info-section .form-group.full-width {
  padding: 0 32px 32px;
}

.additional-info-section .form-group.full-width:first-of-type {
  padding-top: 32px;
}

/* 제출 버튼 */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.submit-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.submit-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .form-main-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .image-upload-section,
  .basic-info-section {
    padding: 24px;
  }
  
  .boat-detail-section .form-grid,
  .boat-detail-section .form-group.full-width,
  .additional-info-section .form-group.full-width {
    padding-left: 24px;
    padding-right: 24px;
  }
  
  .boat-detail-section .section-header,
  .additional-info-section .section-header {
    padding: 20px 24px;
  }
}
</style>