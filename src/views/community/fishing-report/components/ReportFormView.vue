<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/api/axios.js'

const props = defineProps({
  dto: Object,
  loading: Boolean,
  error: String,
})

const emit = defineEmits(['thumbnail-change', 'file-change', 'submit-success', 'submit-error'])

const editorRef = ref(null)
const images = ref([])
const thumbnailFile = ref(null)

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

// JWT 토큰에서 사용자 정보 추출
function getJwtPayload() {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('토큰이 없습니다. 다시 로그인해주세요.')
  }
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('잘못된 JWT 토큰 형식입니다.')
    }
    
    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    if (payload.exp && payload.exp < currentTime) {
      throw new Error('JWT 토큰이 만료되었습니다. 다시 로그인해주세요.')
    }
    
    console.log('JWT 토큰 정보:', {
      uno: payload.uno,
      uid: payload.sub,
      exp: payload.exp,
      currentTime
    })
    
    return payload
  } catch (error) {
    console.error('JWT 토큰 파싱 실패:', error)
    localStorage.removeItem('token')
    throw new Error('유효하지 않은 JWT 토큰입니다. 다시 로그인해주세요.')
  }
}

async function onSubmit() {
  try {
    // JWT 토큰에서 사용자 정보 추출
    const jwtPayload = getJwtPayload()
    const token = localStorage.getItem('token')
    
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
      },
      // JWT에서 추출한 사용자 정보 추가
      userUno: jwtPayload.uno,
      userId: jwtPayload.sub
    }
    console.log('JWT 기반 조황정보 등록 요청:', dtoToSend);

    formData.append('dto', new Blob([JSON.stringify(dtoToSend)], { type: 'application/json' }))

    // JWT 토큰을 명시적으로 헤더에 포함
    const res = await axios.post('/api/fishing-report/create', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('JWT 기반 조황정보 등록 성공:', res.data)
    emit('submit-success', res.data)
  } catch (err) {
    console.error('JWT 기반 조황정보 등록 실패:', err)
    
    // JWT 토큰 관련 에러 처리
    if (err.message && err.message.includes('JWT')) {
      alert(err.message)
      window.location.href = '/login'
      return
    }
    
    // 서버 에러 처리
    if (err.response) {
      switch (err.response.status) {
        case 401:
          alert('JWT 인증이 필요합니다. 다시 로그인해주세요.')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          alert('JWT 권한이 없습니다.')
          break
        case 400:
          alert('잘못된 JWT 요청입니다: ' + (err.response.data?.message || '알 수 없는 오류'))
          break
        case 500:
          if (err.response.data?.message?.includes('JWT signature')) {
            alert('JWT 서명이 일치하지 않습니다. 다시 로그인해주세요.')
            localStorage.removeItem('token')
            window.location.href = '/login'
          } else {
            alert('서버 오류가 발생했습니다: ' + err.response.status)
          }
          break
        default:
          alert('서버 오류가 발생했습니다: ' + err.response.status)
      }
    } else {
      alert('네트워크 오류가 발생했습니다.')
    }
    
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
