<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchEventById, deleteEvent } from '@/api/event.js'
import { useAdminAuthStore } from "@/store/auth/auth.js";

import BoardDetailBox from "@/components/common/BoardDetailBox.vue";
import BoardDetailAction from "@/components/common/BoardDetailAction.vue";

const route = useRoute()
const router = useRouter()
const authStore = useAdminAuthStore()

const event = ref(null)
const isAdmin = ref(false)
const loading = ref(true)

const loadEventData = async () => {
  loading.value = true
  try {
    const res = await fetchEventById(route.params.id)
    event.value = res.data
  } catch (error) {
    console.error('이벤트 상세 조회 실패:', error)
    alert('이벤트 정보를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  authStore.loadTokenFromStorage()
  isAdmin.value = !!authStore.token
  await loadEventData()
})

const handleEdit = () => {
  router.push(`/event/edit/${route.params.id}`)
}

const handleDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  
  // 토큰 유효성 확인
  if (!authStore.isTokenValid()) {
    alert('인증이 만료되었습니다. 다시 로그인해주세요.')
    router.push('/admin/login')
    return
  }
  
  try {
    await deleteEvent(route.params.id)
    alert('이벤트가 삭제되었습니다.')
    router.push('/event')
  } catch (error) {
    console.error('이벤트 삭제 실패:', error)
    if (error.response && error.response.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.')
      router.push('/admin/login')
    } else {
      alert('이벤트 삭제에 실패했습니다.')
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '미정'
  return new Date(dateStr).toLocaleDateString('ko-KR')
}
</script>

<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>이벤트를 불러오는 중...</p>
    </div>
  </div>
  
  <div v-else-if="event" class="board-detail">
    <BoardDetailBox>
      <template #title>
        <div class="d-flex justify-between align-items-center">
          <span>{{ event.title }}</span>
          <span class="badge bg-success ms-2">{{ event.eventStatus }}</span>
        </div>
      </template>

      <template #info>
        <div class="text-muted small">
          <span>기간: {{ formatDate(event.startAt) }} ~ {{ formatDate(event.endAt) }}</span>
          <span class="ms-3">작성일: {{ formatDate(event.createdAt) }}</span>
        </div>
      </template>

      <template #default>
        <hr class="board-divider" />
        <div v-if="event.thumbnailUrl" class="event-thumbnail mb-3">
          <img :src="event.thumbnailUrl" alt="이벤트 썸네일" class="img-fluid rounded" />
        </div>
        <div v-html="event.content" class="mt-4" />
      </template>
    </BoardDetailBox>

    <BoardDetailAction @edit="handleEdit" @delete="handleDelete" />
  </div>
  
  <div v-else class="error-container">
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>이벤트를 찾을 수 없습니다.</p>
      <button @click="router.push('/event')" class="btn btn-primary">목록으로 돌아가기</button>
    </div>
  </div>
</template>

<style scoped>
.board-detail {
  width: 80%;
  margin: 5% auto;
}

hr.board-divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 1rem 0;
}

.event-thumbnail img {
  max-width: 100%;
  height: auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner {
  text-align: center;
  color: #718096;
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-message {
  text-align: center;
  color: #718096;
}

.error-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #e53e3e;
}
</style>