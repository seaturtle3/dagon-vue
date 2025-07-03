<script setup>
import {reactive, onMounted, ref, computed} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {createEvent, updateEvent, fetchEventById} from '@/api/event.js'
import BoardWriteForm from '@/components/common/BoardWriteForm.vue'
import RichTextEditorEvent from '@/components/common/RichTextEditorEvent.vue'
import {useAdminAuthStore} from '@/store/auth/auth.js'
import {BASE_URL} from "@/constants/baseUrl.js";

const router = useRouter()
const route = useRoute()
const authStore = useAdminAuthStore()
authStore.loadTokenFromStorage()
const token = authStore.token

const eventId = route.params.id
const isEdit = !!eventId

console.log("--------------eventId>",eventId)
console.log("--------------0isEdit>",isEdit)

// 이미지 관련 상태 추가
const files = ref([])
const imagePreviews = ref([])
const existingImages = ref([])
const deletedImageNames = ref([])
const editorImageChanges = ref({
  deletedImages: [],
  newImages: [],
  existingImages: []
})

const form = reactive({
  title: '',
  content: '',
  startAt: '',
  endAt: '',
  thumbnailUrl: '',
  isTop: false
})

const event = ref(null)
const imageIdList = ref([])
const richTextEditorRef = ref(null)

const loadEventData = async () => {
  const res = await fetchEventById(route.params.id)
  event.value = res.data
  imageIdList.value = res.data.imageIdList || []
}

// ✅ 저장 요청
async function submit() {
  // 유효성 검사
  if (!form.title || !form.title.trim()) {
    alert('제목을 입력하세요.')
    return
  }

  if (!form.content || form.content.trim() === '<p><br></p>') {
    alert('내용을 입력하세요.')
    return
  }

  // 토큰 유효성 확인
  if (!authStore.isTokenValid()) {
    alert('인증이 만료되었습니다. 다시 로그인해주세요.')
    router.push('/admin/login')
    return
  }

  try {
    // input으로 업로드된 이미지들에 썸네일 플래그 추가
    const thumbnailFiles = files.value.map(file => ({
      file: file,
      isThumbnail: true,
      imageType: 'thumbnail'
    }))
    
    const eventData = {
      title: form.title.trim(),
      content: form.content.trim(),
      startAt: form.startAt || null,
      endAt: form.endAt || null,
      thumbnailUrl: form.thumbnailUrl || null,
      isTop: form.isTop,
      deleteImageNames: [...deletedImageNames.value],
      editorImageChanges: editorImageChanges.value
    }

    console.log("--------------isEdit>",isEdit)
    console.log("--------------2eventId>",eventId)
    console.log("--------------2imageIdList>",imageIdList)
    console.log("--------------editorImageChanges>",editorImageChanges.value)
    console.log("--------------thumbnailFiles>",thumbnailFiles)
    console.log("--------------썸네일 이미지 개수>",thumbnailFiles.length)

    if (isEdit) {
      console.log("--------------3eventId>",eventId)
      console.log("--------------3imageIdList>",imageIdList)
      await updateEvent(eventId, eventData, thumbnailFiles)
      alert('이벤트가 수정되었습니다.')
    } else {
      await createEvent(eventData, thumbnailFiles)
      alert('이벤트가 등록되었습니다.')
    }
    router.push('/event')
  } catch (err) {
    console.error('저장 실패:', err)
    if (err.response && err.response.data) {
      const errorMessages = err.response.data
      if (Array.isArray(errorMessages)) {
        alert('입력 오류:\n' + errorMessages.map(err => err.defaultMessage).join('\n'))
      } else {
        alert('저장 중 오류가 발생했습니다.')
      }
    } else {
      alert('저장 중 오류가 발생했습니다.')
    }
  }
}

// ✅ 수정일 경우 데이터 불러오기
onMounted(async () => {
  if (isEdit) {
    try {
      const res = await fetchEventById(eventId)
      Object.assign(form, res.data)
      
      // 기존 이미지가 있으면 로드
      if (res.data.imageDataList && res.data.imageDataList.length > 0) {
        existingImages.value = res.data.imageDataList.map((imageData, idx) => ({
          id: 'existing-' + idx,
          url: `data:image/jpeg;base64,${imageData}`,
          name: `image_${idx}`,
          isExisting: true,
          originalImage: {
            imageData: imageData
          }
        }))
        
        // 기존 이미지를 files 배열에 추가
        existingImages.value.forEach((existingImg, idx) => {
          if (existingImg.originalImage && existingImg.originalImage.imageData) {
            const byteCharacters = atob(existingImg.originalImage.imageData)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'image/jpeg' })
            const file = new File([blob], existingImg.name, { type: 'image/jpeg' })
            files.value.push(file)
          }
        })
      }
    } catch (err) {
      console.error('이벤트 조회 실패:', err)
      alert('이벤트 정보를 불러오는데 실패했습니다.')
    }
  }
})

// ✅ 이미지 업로드 처리 (조행기 방식 참고)
function handleImageUpload(event) {
  const uploadedFiles = Array.from(event.target.files)
  files.value = []
  imagePreviews.value = []
  
  uploadedFiles.forEach(file => {
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
  })
}

// 이미지 제거
function removeImage(imageId) {
  const index = imagePreviews.value.findIndex(img => img.id === imageId)
  if (index > -1) {
    const image = imagePreviews.value[index]
    
    const fileIndex = files.value.findIndex(file => file === image.file)
    if (fileIndex > -1) {
      files.value.splice(fileIndex, 1)
    }
    
    imagePreviews.value.splice(index, 1)
  }
}

// 기존 이미지 제거
function removeExistingImage(imageId) {
  const idx = existingImages.value.findIndex(img => img.id === imageId)
  if (idx > -1) {
    const existingImg = existingImages.value[idx]
    deletedImageNames.value.push(existingImg.name)
    existingImages.value.splice(idx, 1)
    
    const fileIndex = files.value.findIndex(file => file.name === existingImg.name)
    if (fileIndex > -1) {
      files.value.splice(fileIndex, 1)
    }
  }
}

// 모든 이미지 미리보기
const allPreviews = computed(() => [...existingImages.value, ...imagePreviews.value])

function goBack() {
  router.back()
}

const deleteAllImages = async () => {
  if (!event.value || !event.value.eventId || !imageIdList.value.length) return
  await fetch('/api/images/deleteBatch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventId: event.value.eventId,
      imageIdList: imageIdList.value
    })
  })
}

// 에디터에서 이미지 데이터를 받는 함수 (백엔드에서 자동 처리되므로 로그만 출력)
const handleEditorImageData = (imageData) => {
  console.log('에디터 이미지 업로드 완료:', imageData)
}

// 에디터에서 이미지 변경사항을 받는 함수
const handleEditorImageChanges = (changes) => {
  editorImageChanges.value = changes
  console.log('에디터 이미지 변경사항:', changes)
  
  // 삭제된 이미지가 있으면 확인
  if (changes.deletedImages && changes.deletedImages.length > 0) {
    console.log('삭제된 이미지들:', changes.deletedImages)
  }
  
  // 새로 추가된 이미지가 있으면 확인
  if (changes.newImages && changes.newImages.length > 0) {
    console.log('새로 추가된 이미지들:', changes.newImages)
  }
}
</script>

<template>
  <div class="center">
    <BoardWriteForm @submit="submit" @cancel="goBack">
      <template #fields>
        <div class="form-group mb-3">
          <label>제목 *</label>
          <input v-model="form.title" class="form-control" required placeholder="이벤트 제목을 입력하세요"/>
        </div>

        <div class="form-group mb-3">
          <label>이미지 업로드</label>
          <input type="file" class="form-control" accept="image/*" multiple @change="handleImageUpload"/>
          <small class="form-text text-muted">5MB 이하의 이미지 파일만 업로드 가능합니다.</small>
          
          <!-- 이미지 미리보기 -->
          <div v-if="allPreviews.length > 0" class="image-previews mt-3">
            <div v-for="image in allPreviews" :key="image.id" class="image-preview-item">
              <img :src="image.url" :alt="image.name" class="preview-image"/>
              <button 
                type="button" 
                @click="image.isExisting ? removeExistingImage(image.id) : removeImage(image.id)"
                class="remove-image-btn"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div class="form-group mb-3">
          <label>이벤트 기간</label>
          <div class="d-flex gap-2">
            <input type="date" v-model="form.startAt" class="form-control"/>
            <span class="mx-2">~</span>
            <input type="date" v-model="form.endAt" class="form-control"/>
          </div>
          <small class="form-text text-muted">기간을 설정하지 않으면 상시 진행으로 표시됩니다.</small>
        </div>

        <div class="form-group mb-3">
          <label>내용 *</label>
          <RichTextEditorEvent 
            v-model="form.content" 
            :eventId="eventId" 
            :existingImages="existingImages"
            @imageData="handleEditorImageData" 
            @imageChanges="handleEditorImageChanges"
            ref="richTextEditorRef"
          />
        </div>

        <div class="form-check mb-3">
          <input type="checkbox" class="form-check-input" id="isTop" v-model="form.isTop"/>
          <label for="isTop" class="form-check-label">상단 고정</label>
        </div>
      </template>
    </BoardWriteForm>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
.form-text {
  font-size: 0.875rem;
  color: #6c757d;
}

.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-preview-item {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.remove-image-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-image-btn:hover {
  background: #c82333;
}
</style>