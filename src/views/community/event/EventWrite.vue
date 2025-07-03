<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createEvent, updateEvent, fetchEventById } from '@/api/event.js'
import BoardWriteForm from '@/components/common/BoardWriteForm.vue'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { useAdminAuthStore } from '@/store/auth/auth.js'

const router = useRouter()
const route = useRoute()
const authStore = useAdminAuthStore()
authStore.loadTokenFromStorage()
const token = authStore.token

const eventId = route.params.id
const isEdit = !!eventId

const form = reactive({
  title: '',
  content: '',
  startAt: '',
  endAt: '',
  thumbnailUrl: '',
  isTop: false
})

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
    const eventData = {
      title: form.title.trim(),
      content: form.content.trim(),
      startAt: form.startAt || null,
      endAt: form.endAt || null,
      thumbnailUrl: form.thumbnailUrl || null,
      isTop: form.isTop
    }

    if (isEdit) {
      await updateEvent(eventId, eventData)
      alert('이벤트가 수정되었습니다.')
    } else {
      await createEvent(eventData)
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
    } catch (err) {
      console.error('이벤트 조회 실패:', err)
      alert('이벤트 정보를 불러오는데 실패했습니다.')
    }
  }
})

// ✅ 썸네일 파일 선택 시 이미지 업로드 처리
async function handleThumbnailUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // 파일 크기 검사 (5MB 제한)
  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB 이하여야 합니다.')
    return
  }

  // 파일 타입 검사
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.')
    return
  }

  const formData = new FormData()
  formData.append('image', file)

  try {
    const res = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (!res.ok) {
      throw new Error('이미지 업로드 실패')
    }
    
    const fileName = await res.text()
    const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL
    form.thumbnailUrl = `${baseUrl}/${fileName}`
  } catch (err) {
    console.error('썸네일 업로드 실패:', err)
    alert('썸네일 업로드에 실패했습니다.')
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <BoardWriteForm @submit="submit" @cancel="goBack">
    <template #fields>
      <div class="form-group mb-3">
        <label>제목 *</label>
        <input v-model="form.title" class="form-control" required placeholder="이벤트 제목을 입력하세요" />
      </div>

      <div class="form-group mb-3">
        <label>썸네일 이미지</label>
        <input type="file" class="form-control" accept="image/*" @change="handleThumbnailUpload" />
        <small class="form-text text-muted">5MB 이하의 이미지 파일만 업로드 가능합니다.</small>
        <div v-if="form.thumbnailUrl" class="mt-2">
          <img :src="form.thumbnailUrl" alt="썸네일 미리보기" style="max-width: 200px; border-radius: 4px;" />
        </div>
      </div>

      <div class="form-group mb-3">
        <label>이벤트 기간</label>
        <div class="d-flex gap-2">
          <input type="date" v-model="form.startAt" class="form-control" />
          <span class="mx-2">~</span>
          <input type="date" v-model="form.endAt" class="form-control" />
        </div>
        <small class="form-text text-muted">기간을 설정하지 않으면 상시 진행으로 표시됩니다.</small>
      </div>

      <div class="form-group mb-3">
        <label>내용 *</label>
        <RichTextEditor v-model="form.content" />
      </div>

      <div class="form-check mb-3">
        <input type="checkbox" class="form-check-input" id="isTop" v-model="form.isTop" />
        <label for="isTop" class="form-check-label">상단 고정</label>
      </div>
    </template>
  </BoardWriteForm>
</template>

<style scoped>
.board-detail {
  width: 80%;
  margin: 5% auto;
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
}
</style>