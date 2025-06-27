<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/lib/axios'
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
  if (!form.title || !form.content || form.content.trim() === '<p><br></p>') {
    alert('제목과 내용을 모두 입력하세요.')
    return
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  try {
    if (isEdit) {
      await api.post(`/admin/event/${eventId}`, form, config)
    } else {
      await api.post('/admin/event', form, config)
    }
    router.push('/event')
  } catch (err) {
    console.error('저장 실패:', err)
    alert('저장 중 오류 발생')
  }
}

// ✅ 수정일 경우 데이터 불러오기
onMounted(async () => {
  if (isEdit) {
    try {
      const res = await api.get(`/event/${eventId}`)
      Object.assign(form, res.data)
    } catch (err) {
      console.error('이벤트 조회 실패:', err)
    }
  }
})

// ✅ 썸네일 파일 선택 시 이미지 업로드 처리
async function handleThumbnailUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  try {
    const res = await api.post('/images/upload', formData)
    const fileName = res.data
    const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL
    form.thumbnailUrl = `${baseUrl}/${fileName}`
  } catch (err) {
    console.error('썸네일 업로드 실패:', err)
    alert('썸네일 업로드 실패')
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
        <label>제목</label>
        <input v-model="form.title" class="form-control" required />
      </div>

      <div class="form-group mb-3">
        <label>썸네일 이미지</label>
        <input type="file" class="form-control" accept="image/*" @change="handleThumbnailUpload" />
        <div v-if="form.thumbnailUrl" class="mt-2">
          <img :src="form.thumbnailUrl" alt="썸네일 미리보기" style="max-width: 200px;" />
        </div>
      </div>

      <div class="form-group mb-3">
        <label>이벤트 기간</label>
        <div class="d-flex gap-2">
          <input type="date" v-model="form.startAt" class="form-control" />
          <span class="mx-2">~</span>
          <input type="date" v-model="form.endAt" class="form-control" />
        </div>
      </div>

      <div class="form-group mb-3">
        <label>내용</label>
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
</style>