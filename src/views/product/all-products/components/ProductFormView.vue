<script setup>
import {reactive, watch, toRefs, onMounted, ref} from 'vue'
import {createProduct} from "@/api/product.js";

const file = ref(null)  // 파일 업로드 항목 추가
const imagePreview = ref(null) // 이미지 미리보기

const props = defineProps({
  form: Object,
  regions: Array,
  mainTypes: Array,
  subTypes: Array
})

const localForm = reactive({...props.form})

// props.form이 바뀌면 localForm도 반영
watch(
    () => props.form,
    (newForm) => {
      Object.assign(localForm, newForm)
    },
    {deep: true}
)

onMounted(() => {
  // ✅ enum 배열이 로드된 뒤 가장 첫 값으로 초기화
  if (!localForm.prodRegion && props.regions.length > 0) {
    localForm.prodRegion = props.regions[0].name
  }
  if (!localForm.mainType && props.mainTypes.length > 0) {
    localForm.mainType = props.mainTypes[0].name
  }
  if (!localForm.subType && props.subTypes.length > 0) {
    localForm.subType = props.subTypes[0].name
  }
})

function onFileChange(event) {
  const uploadedFile = event.target.files[0]
  if (uploadedFile) {
    file.value = uploadedFile
    
    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(uploadedFile)
  }
}

function removeImage() {
  file.value = null
  imagePreview.value = null
}

async function submit() {
  const formData = new FormData()

  // 👉 여기를 JSON 전체로 묶어서 하나의 Blob으로 추가해야 함
  const productJson = {...localForm}
  formData.append(
      "product",
      new Blob([JSON.stringify(productJson)], {type: "application/json"})
  )

  if (file.value) {
    formData.append("thumbnailFile", file.value)
  }

  try {
    const response = await createProduct(formData)
    alert('등록 성공')
  } catch (err) {
    console.error(err)
    alert('등록 실패')
  }
}


</script>

<template>
  <div class="product-form-container">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1 class="page-title">배 상품 등록</h1>
      <p class="page-subtitle">새로운 배 상품을 등록해보세요</p>
    </div>

    <form @submit.prevent="submit" class="product-form">
      <!-- 메인 정보 섹션 -->
      <div class="form-main-section">
        <!-- 이미지 업로드 영역 -->
        <div class="image-upload-section">
          <div class="upload-container">
            <div v-if="!imagePreview" class="upload-placeholder">
              <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
              </div>
              <p class="upload-text">대표 이미지를 업로드하세요</p>
              <p class="upload-hint">JPG, PNG 파일만 가능합니다</p>
            </div>
            <div v-else class="image-preview-container">
              <img :src="imagePreview" alt="미리보기" class="image-preview" />
              <button type="button" @click="removeImage" class="remove-image-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              @change="onFileChange" 
              class="file-input"
              id="imageUpload"
            />
            <label for="imageUpload" class="upload-label">
              {{ imagePreview ? '이미지 변경' : '이미지 선택' }}
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
                <option v-for="sub in subTypes" :key="sub.name" :value="sub.name">
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
              <label class="form-label required">최소 인원</label>
              <input 
                v-model.number="localForm.minPerson" 
                type="number" 
                class="form-input" 
                placeholder="최소 필요 인원"
                required
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
            <label class="form-label">선박 무게</label>
            <input 
              v-model.number="localForm.weight" 
              step="0.01" 
              type="number" 
              class="form-input"
              placeholder="배 무게 (톤)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">선박 주소</label>
            <input 
              v-model="localForm.prodAddress" 
              type="text" 
              class="form-input"
              placeholder="배가 위치한 주소"
            />
          </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">상세 설명</label>
          <textarea 
            v-model="localForm.prodDescription" 
            class="form-textarea"
            placeholder="배에 대한 상세한 설명을 입력하세요"
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
          <label class="form-label">이벤트</label>
          <textarea 
            v-model="localForm.prodEvent" 
            class="form-textarea"
            placeholder="진행 중인 이벤트나 특별한 혜택이 있다면 입력하세요"
            rows="3"
          ></textarea>
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
      </div>

      <!-- 제출 버튼 -->
      <div class="form-actions">
        <button type="submit" class="submit-button">
          <i class="fas fa-save"></i>
          상품 등록
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
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
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
  margin: 0;
}

.image-preview-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.image-preview {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background: rgba(220, 38, 38, 1);
}

.file-input {
  display: none;
}

.upload-label {
  display: inline-block;
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

.submit-button:hover {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.submit-button:active {
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