<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchEventById, deleteEvent, fetchEvents } from '@/api/event.js'
import { useAdminAuthStore } from "@/store/auth/auth.js";

import BoardDetailBox from "@/components/common/BoardDetailBox.vue";
import BoardDetailAction from "@/components/common/BoardDetailAction.vue";
import {BASE_URL} from "@/constants/baseUrl.js";

const route = useRoute()
const router = useRouter()
const authStore = useAdminAuthStore()

const event = ref(null)
const isAdmin = ref(false)
const loading = ref(true)

const prevEvent = ref(null)
const nextEvent = ref(null)

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

const loadNavigationEvents = async () => {
  try {
    const params = { page: 0, size: 100 }
    const res = await fetchEvents(params)
    const allEvents = res.data.content
    const currentIndex = allEvents.findIndex(e => String(e.eventId) === String(route.params.id))
    if (currentIndex > 0) prevEvent.value = allEvents[currentIndex - 1]
    else prevEvent.value = null
    if (currentIndex < allEvents.length - 1 && currentIndex !== -1) nextEvent.value = allEvents[currentIndex + 1]
    else nextEvent.value = null
    // 디버깅용
    // console.log('allEvents:', allEvents)
    // console.log('route.params.id:', route.params.id)
    // console.log('currentIndex:', currentIndex)
  } catch (error) {
    console.error('이전/다음 이벤트 정보 로드 실패:', error)
  }
}

onMounted(async () => {
  authStore.loadTokenFromStorage()
  isAdmin.value = !!authStore.token
  await loadEventData()
  await loadNavigationEvents()
})

// 라우트 파라미터 변경 감지 (이전글/다음글 이동 시 데이터 재로딩)
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId) {
    event.value = null
    prevEvent.value = null
    nextEvent.value = null
    await loadEventData()
    await loadNavigationEvents()
  }
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

const goToPrevEvent = () => {
  if (prevEvent.value) router.push(`/event/${prevEvent.value.eventId}`)
}
const goToNextEvent = () => {
  if (nextEvent.value) router.push(`/event/${nextEvent.value.eventId}`)
}
const goToEventList = () => {
  router.push('/event')
}

// 이미지 URL 처리 함수
const getImageUrl = (image) => {
  if (image.imageData) {
    return `data:image/jpeg;base64,${image.imageData}`
  } else if (image.image_data) {
    return `data:image/jpeg;base64,${image.image_data}`
  } else if (image.imageUrl) {
    if (image.imageUrl.startsWith('http')) {
      return image.imageUrl
    }
    return `${BASE_URL}${image.imageUrl}`
  } else if (image.image_url) {
    if (image.image_url.startsWith('http')) {
      return image.image_url
    }
    return `${BASE_URL}${image.image_url}`
  }
  return '/images/default-product.jpg'
}
// 이벤트 썸네일 이미지 가져오기
const getEventThumbnail = () => {
  // eventId가 있으면 썸네일 API 호출
  if (event.value?.eventId) {
    return `${BASE_URL}/api/images/event/${event.value.eventId}/thumb`
  }
  
  // 기존 방식으로 fallback
  if (event.value?.imageDataList && event.value.imageDataList.length > 0) {
    return event.value.imageDataList
  }
  if (event.value?.thumbnailDataList && event.value.thumbnailDataList.length > 0) {
    return event.value.thumbnailDataList
  }
  if (event.value?.images && event.value.images.length > 0) {
    return event.value.images
  }
  
  
  // 아무것도 없으면 빈 배열
  return []
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
        <div class="d-flex justify-between align-items-center" style="position:relative;">
          <span>{{ event.title }}</span>
          <!-- 제목 오른쪽에 점세개(더보기) 버튼 -->
          <BoardDetailAction showTopMenu @edit="handleEdit" @delete="handleDelete" />
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
        
        <!-- 이미지 표시 -->
        <div v-if="event.imageDataList && event.imageDataList.length > 0" class="event-images mt-4 mb-4">
          <div class="image-gallery">
            <div v-for="(image, index) in event.imageDataList" :key="index" class="image-item">
              <img 
                :src="`data:image/jpeg;base64,${image}`"
                :alt="`이벤트 이미지 ${index + 1}`"
                class="event-image"
              />
            </div>
          </div>
        </div>
        <div v-html="event.content" class="mt-4" />
      </template>
    </BoardDetailBox>

    <!-- 하단 액션 버튼 -->
    <BoardDetailAction @edit="handleEdit" @delete="handleDelete" />

    <!-- 이전글/다음글 네비게이션 -->
    <div class="navigation-container">
      <div class="navigation-buttons">
        <!-- 이전글 버튼 -->
        <button 
          v-if="prevEvent" 
          @click="goToPrevEvent" 
          class="nav-button prev-button"
          :title="`이전글: ${prevEvent.title}`"
          type="button"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
          <span class="nav-text">
            <span class="nav-label">이전글</span>
            <span class="nav-title">{{ prevEvent.title }}</span>
          </span>
        </button>
        <div v-else class="nav-button disabled">
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
          <span class="nav-text">
            <span class="nav-label">이전글</span>
            <span class="nav-title">이전 글이 없습니다</span>
          </span>
        </div>

        <!-- 목록으로 버튼 -->
        <button @click="goToEventList" class="nav-button list-button" type="button">
          <font-awesome-icon icon="fa-solid fa-list" />
          <span class="nav-text">
            <span class="nav-label">목록</span>
          </span>
        </button>

        <!-- 다음글 버튼 -->
        <button 
          v-if="nextEvent" 
          @click="goToNextEvent" 
          class="nav-button next-button"
          :title="`다음글: ${nextEvent.title}`"
          type="button"
        >
          <span class="nav-text">
            <span class="nav-label">다음글</span>
            <span class="nav-title">{{ nextEvent.title }}</span>
          </span>
          <font-awesome-icon icon="fa-solid fa-chevron-right" />
        </button>
        <div v-else class="nav-button disabled">
          <span class="nav-text">
            <span class="nav-label">다음글</span>
            <span class="nav-title">다음 글이 없습니다</span>
          </span>
          <font-awesome-icon icon="fa-solid fa-chevron-right" />
        </div>
      </div>
    </div>
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

.navigation-container {
  margin-top: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  max-width: 300px;
  pointer-events: auto;
  user-select: none;
}

.nav-button:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav-button.disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.6;
  pointer-events: none;
}

.prev-button {
  text-align: left;
}

.next-button {
  text-align: right;
}

.list-button {
  background: #667eea;
  color: white;
  border-color: #667eea;
  justify-content: center;
}

.list-button:hover {
  background: #5a67d8;
  border-color: #5a67d8;
}

.nav-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #718096;
}

.nav-title {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.list-button .nav-label {
  color: rgba(255, 255, 255, 0.9);
}

.nav-button i {
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .navigation-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .nav-button {
    width: 100%;
    max-width: none;
    justify-content: center;
  }
  
  .prev-button,
  .next-button {
    text-align: center;
    flex-direction: row;
  }
  
  .nav-title {
    max-width: 150px;
  }
}

/* 로딩 상태 */
.loading-container {
  width: 80%;
  margin: 5% auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
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

.loading-spinner p {
  margin: 0;
  font-size: 1rem;
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

/* 이미지 갤러리 스타일 */
.event-images {
  margin: 2rem 0;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.image-item {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: contain;
  background-color: #f8f9fa;
  transition: opacity 0.3s ease;
}

/* 이미지 모달 스타일 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: default;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 18px;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.9);
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
}

/* 반응형 이미지 갤러리 */
@media (max-width: 768px) {
  .image-gallery {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.5rem;
  }
  
  .event-image {
    height: 150px;
  }
  
  .modal-content {
    max-width: 95%;
    max-height: 95%;
  }
}
</style>