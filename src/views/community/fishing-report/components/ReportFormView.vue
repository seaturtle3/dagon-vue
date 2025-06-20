
<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/api/axios.js'
import { useAdminAuthStore } from '@/store/auth/auth.js'  // 경로 맞춰줘

const props = defineProps({
  dto: Object,
  loading: Boolean,
  error: String,
})

const emit = defineEmits(['thumbnail-change', 'file-change', 'submit-success', 'submit-error'])

const editorRef = ref(null)
const images = ref([])
const thumbnailFile = ref(null)

const adminAuthStore = useAdminAuthStore()

function onThumbnailChange(event) {
  const file = event.target.files[0]
  thumbnailFile.value = file
}

function onFileChange(event) {
  images.value = Array.from(event.target.files)
}

onMounted(() => {
  $(editorRef.value).summernote({
    height: 600,
    placeholder: '내용을 입력하세요',
    callbacks: {
      onChange: function (contents) {
        props.dto.content = contents
      }
    }
  })
})

async function onSubmit() {
  try {
    const formData = new FormData()

    if (thumbnailFile.value) {
      formData.append('images', thumbnailFile.value)
    }

    images.value.forEach(file => {
      formData.append('images', file)
    })

    const dtoToSend = {
      title: props.dto.title,
      content: props.dto.content,
      fishingAt: props.dto.fishingAt,
      product: {
        prodId: props.dto.product?.prodId
      }
    }
    console.log('=========dtoToSend : ', dtoToSend);

    formData.append('dto', new Blob([JSON.stringify(dtoToSend)], { type: 'application/json' }))

    const token = adminAuthStore.token
    if (!token) throw new Error('로그인 토큰이 없습니다.')

    const res = await axios.post('/api/fishing-report/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })

    emit('submit-success', res.data)
  } catch (err) {
    console.error(err)
    emit('submit-error', err)
  }
}
</script>

<template>
  <div class="detail-container editor-wrapper">
    <h2 class="text-center mb-5 fw-bold">조황 정보 등록</h2>

    <form @submit.prevent="onSubmit">
      <!-- 제목 -->
      <div class="mb-4">
        <input v-model="dto.title" class="form-control" required placeholder="제목을 입력하세요" />
      </div>

      <!-- 날짜 -->
      <div class="mb-4">
        <input type="date" v-model="dto.fishingAt" class="form-control" required />
      </div>

      <!-- 대표 썸네일 -->
      <div class="mb-4">
        <label class="form-label">대표 썸네일</label>
        <input type="file" accept="image/*" class="form-control" @change="onThumbnailChange" />
      </div>

      <!-- 내용 -->
      <div class="mb-4">
        <label class="form-label">내용</label>
        <div ref="editorRef"></div>
      </div>

      <!-- 에러 표시 -->
      <p v-if="error" class="text-danger">{{ error }}</p>

      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? '등록 중...' : '등록하기' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.editor-wrapper {
  max-width: 900px;
  margin: 0 auto;
}
</style>
