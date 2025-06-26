<script setup>
import {ref, onMounted, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {fetchNoticeById, deleteNotice, fetchNotices} from "@/api/notice.js";
import {useAdminAuthStore} from "@/store/auth/auth.js";

import BoardDetailBox from "@/components/common/BoardDetailBox.vue";
import BoardDetailAction from "@/components/common/BoardDetailAction.vue";

const route = useRoute()
const router = useRouter()
const authStore = useAdminAuthStore()

const notice = ref(null)
const isAdmin = ref(false)
const prevNotice = ref(null)
const nextNotice = ref(null)

const loadNoticeData = async () => {
  try {
    console.log('공지사항 데이터 로드 시작, ID:', route.params.id)
    const {data} = await fetchNoticeById(route.params.id)
    notice.value = data
    console.log('공지사항 로드 완료:', data)
    
    // 이전글/다음글 정보 가져오기
    await loadNavigationNotices()
  } catch (error) {
    console.error('공지사항 상세 조회 실패:', error)
    // 에러 처리
  }
}

onMounted(async () => {
  authStore.loadTokenFromStorage()
  isAdmin.value = !!authStore.token
  await loadNoticeData()
})

// 라우트 파라미터 변경 감지
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId) {
    console.log('라우트 변경 감지:', oldId, '->', newId)
    notice.value = null // 기존 데이터 초기화
    prevNotice.value = null
    nextNotice.value = null
    await loadNoticeData()
  }
}, { immediate: false })

const loadNavigationNotices = async () => {
  try {
    console.log('네비게이션 데이터 로드 시작')
    const params = {
      page: 0,
      size: 100 // 충분한 수의 공지사항을 가져옴
    }
    
    const res = await fetchNotices(params)
    const allNotices = res.data.content
    console.log('전체 공지사항:', allNotices)
    
    // 현재 공지사항의 인덱스 찾기
    const currentIndex = allNotices.findIndex(n => n.noticeId == route.params.id)
    console.log('현재 공지사항 인덱스:', currentIndex, 'ID:', route.params.id)
    
    if (currentIndex > 0) {
      prevNotice.value = allNotices[currentIndex - 1]
      console.log('이전글 설정:', prevNotice.value)
    }
    
    if (currentIndex < allNotices.length - 1) {
      nextNotice.value = allNotices[currentIndex + 1]
      console.log('다음글 설정:', nextNotice.value)
    }
  } catch (error) {
    console.error('이전글/다음글 정보 로드 실패:', error)
  }
}

const goToPrevNotice = () => {
  console.log('이전글 클릭됨:', prevNotice.value)
  if (prevNotice.value) {
    console.log('이전글으로 이동:', prevNotice.value.noticeId)
    router.push(`/notice/${prevNotice.value.noticeId}`)
  }
}

const goToNextNotice = () => {
  console.log('다음글 클릭됨:', nextNotice.value)
  if (nextNotice.value) {
    console.log('다음글으로 이동:', nextNotice.value.noticeId)
    router.push(`/notice/${nextNotice.value.noticeId}`)
  }
}

const goToList = () => {
  console.log('목록으로 이동')
  router.push('/notice')
}

const handleEdit = () => {
  router.push(`/notice/edit/${route.params.id}`)
}

const handleDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  await deleteNotice(route.params.id, authStore.token)
  router.push('/notice')
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div v-if="notice" class="board-detail" :key="route.params.id">
    <BoardDetailBox>
      <template #title>
        <div class="d-flex justify-between align-items-center">
          <span>{{ notice.title }}</span>
        </div>
      </template>

      <template #info>
        <div class="text-muted small">
        {{ formatDate(notice.createdAt) }}
          <span class="ms-3 text-secondary">작성자: {{ notice.adminName }}</span>
        </div>

      </template>

      <template #default>
        <hr class="board-divider" />
        <div v-html="notice.content" class="mt-4" />
      </template>
    </BoardDetailBox>

    <BoardDetailAction @edit="handleEdit" @delete="handleDelete" />

    <!-- 이전글/다음글 네비게이션 -->
    <div class="navigation-container">
      <div class="navigation-buttons">
        <!-- 이전글 버튼 -->
        <button 
          v-if="prevNotice" 
          @click="goToPrevNotice" 
          class="nav-button prev-button"
          :title="`이전글: ${prevNotice.title}`"
          type="button"
        >
          <i class="fas fa-chevron-left"></i>
          <span class="nav-text">
            <span class="nav-label">이전글</span>
            <span class="nav-title">{{ prevNotice.title }}</span>
          </span>
        </button>
        <div v-else class="nav-button disabled">
          <i class="fas fa-chevron-left"></i>
          <span class="nav-text">
            <span class="nav-label">이전글</span>
            <span class="nav-title">이전 글이 없습니다</span>
          </span>
        </div>

        <!-- 목록으로 버튼 -->
        <button @click="goToList" class="nav-button list-button" type="button">
          <i class="fas fa-list"></i>
          <span class="nav-text">
            <span class="nav-label">목록</span>
          </span>
        </button>

        <!-- 다음글 버튼 -->
        <button 
          v-if="nextNotice" 
          @click="goToNextNotice" 
          class="nav-button next-button"
          :title="`다음글: ${nextNotice.title}`"
          type="button"
        >
          <span class="nav-text">
            <span class="nav-label">다음글</span>
            <span class="nav-title">{{ nextNotice.title }}</span>
          </span>
          <i class="fas fa-chevron-right"></i>
        </button>
        <div v-else class="nav-button disabled">
          <span class="nav-text">
            <span class="nav-label">다음글</span>
            <span class="nav-title">다음 글이 없습니다</span>
          </span>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 로딩 상태 -->
  <div v-else class="loading-container">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>공지사항을 불러오는 중...</p>
    </div>
  </div>
</template>

<style scoped>
.board-detail {
  width: 80%;
  margin: 5% auto;
}

.board-buttons {
  margin-top: 1rem;
  text-align: right;
}

hr.board-divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 1rem 0;
}

/* 네비게이션 스타일 */
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
  flex-direction: row-reverse;
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
  
  .next-button {
    flex-direction: row-reverse;
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
</style>