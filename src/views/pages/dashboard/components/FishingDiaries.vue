<template>
  <div class="fishing-diaries-admin">
    <div class="header">
      <h2>조행기 관리</h2>
      <div class="header-actions">
        <div class="page-size-selector">
          <label for="pageSize">페이지 크기:</label>
          <select id="pageSize" v-model="itemsPerPage" @change="onPageSizeChange">
            <option value="10">10개</option>
            <option value="20">20개</option>
            <option value="50">50개</option>
            <option value="100">100개</option>
          </select>
        </div>
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="제목 또는 작성자로 검색..."
            @input="handleSearch"
          >
          <button @click="handleSearch" class="search-btn">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ totalDiaries }}</div>
          <div class="stat-label">전체 조행기</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ todayDiaries }}</div>
          <div class="stat-label">오늘 등록</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ thisWeekDiaries }}</div>
          <div class="stat-label">이번 주 등록</div>
        </div>
      </div>

      <div class="table-container">
        <table class="diaries-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="diary in paginatedDiaries" :key="diary.fdId">
              <td>{{ diary.fdId }}</td>
              <td class="title-cell">
                <div class="title-content">
                  <span class="title">{{ diary.title }}</span>
                  <span v-if="diary.thumbnailUrl" class="has-image">
                    <i class="fas fa-image"></i>
                  </span>
                </div>
              </td>
              <td>{{ diary.user?.nickname || '알 수 없음' }}</td>
              <td>{{ formatDate(diary.fishingAt) }}</td>
              <td class="actions">
                <button @click="viewDiary(diary.fdId)" class="btn-view">
                  보기
                </button>
                <button @click="viewComments(diary.fdId, diary.title)" class="btn-comments">
                  댓글
                </button>
                <button @click="deleteDiary(diary.fdId)" class="btn-delete">
                  <i class="fa-solid fa-x"></i> 삭제
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> 로딩 중...
        </div>

        <div v-if="!loading && (!Array.isArray(diaries) || diaries.length === 0)" class="no-data">
          조행기가 없습니다.
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-container" v-if="totalPages > 1">
        <div class="pagination-info">
          총 {{ totalElements }}개의 조행기 중 {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalElements) }}번째
        </div>
        <div class="pagination">
          <button 
            @click="changePage(1)" 
            :disabled="currentPage === 1"
            class="page-btn"
            title="첫 페이지"
          >
            첫 페이지
          </button>
          
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="!hasPrevious"
            class="page-btn"
            title="이전 페이지"
          >
            이전
          </button>
          
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="changePage(page)"
            :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
          
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="!hasNext"
            class="page-btn"
            title="다음 페이지"
          >
            다음
          </button>
          
          <button 
            @click="changePage(totalPages)" 
            :disabled="currentPage === totalPages"
            class="page-btn"
            title="마지막 페이지"
          >
            마지막 페이지
          </button>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <h3>조행기 삭제</h3>
        <p>정말로 이 조행기를 삭제하시겠습니까?</p>
        <p class="warning">이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="btn-delete">삭제</button>
          <button @click="closeDeleteModal" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>

    <!-- 댓글 관리 모달 -->
    <div v-if="showCommentsModal" class="modal-overlay" @click="closeCommentsModal">
      <div class="modal-content comments-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedDiaryTitle }} - 댓글 관리</h3>
          <button @click="closeCommentsModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="comments-container">
          <div v-if="commentsLoading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> 댓글을 불러오는 중...
          </div>
          
          <div v-else-if="selectedDiaryComments.length === 0" class="no-comments">
            <i class="fas fa-comment-slash"></i>
            <p>등록된 댓글이 없습니다.</p>
          </div>
          
          <div v-else class="comments-list">
            <div v-for="comment in selectedDiaryComments" :key="comment.fdCommentId || comment.id || comment.commentId" class="comment-item" style="display:flex;align-items:center;justify-content:space-between;">
              <div class="comment-content" style="flex:1;">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.user?.nickname || '알 수 없음' }}</span>
                  <span class="comment-date">{{ formatDateTime(comment.createdAt) }}</span>
                </div>
                <div class="comment-text">{{ comment.comment }}</div>
              </div>
              <button
                @click="deleteComment(comment.frCommentId)"
                class="btn-delete-comment"
                style="margin-left:1rem;background:#e74c3c;color:white;border:none;padding:0.5rem 1rem;border-radius:4px;cursor:pointer;font-weight:bold;"
                title="댓글 삭제"
              >
                <i class="fa-solid fa-x"></i> 삭제
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeCommentsModal" class="btn-cancel">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/axios.js'

const router = useRouter()

// 상태 관리
const diaries = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showDeleteModal = ref(false)
const diaryToDelete = ref(null)

// 댓글 관리 상태
const showCommentsModal = ref(false)
const selectedDiaryComments = ref([])
const selectedDiaryTitle = ref('')
const selectedDiaryId = ref(null)
const commentsLoading = ref(false)

// 서버 사이드 페이징을 위한 상태
const totalPages = ref(1)
const totalElements = ref(0)
const hasNext = ref(false)
const hasPrevious = ref(false)

// 통계 데이터
const totalDiaries = ref(0)
const todayDiaries = ref(0)
const thisWeekDiaries = ref(0)

// 계산된 속성
const paginatedDiaries = computed(() => {
  if (!Array.isArray(diaries.value)) {
    return []
  }
  return diaries.value
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 메서드
const loadDiaries = async () => {
  try {
    loading.value = true

    const response = await api.get('/api/admin/fishing-diary/get-all', {
      params: {
        page: currentPage.value - 1,
        size: itemsPerPage.value,
        sortBy: 'fdId',
        direction: 'desc'
      }
    })

    diaries.value = response.data.content
    totalElements.value = response.data.totalElements
    totalPages.value = response.data.totalPages
    totalDiaries.value = totalElements.value
    
    // 오늘 등록된 조행기 수 계산 (클라이언트에서 계산)
    const today = new Date().toISOString().split('T')[0]
    todayDiaries.value = diaries.value.filter(diary => 
      diary.createdAt && diary.createdAt.startsWith(today)
    ).length
    
    // 이번 주 등록된 조행기 수 계산 (클라이언트에서 계산)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    thisWeekDiaries.value = diaries.value.filter(diary => 
      diary.createdAt && new Date(diary.createdAt) >= weekAgo
    ).length
    
    console.log('로드된 조행기 목록:', response.data)
  } catch (error) {
    console.error('조행기 목록 로드 실패:', error)
    alert('조행기를 불러오는데 실패했습니다: ' + error.response?.data || error.message)
    diaries.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadDiaries()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadDiaries()
  }
}

const viewDiary = (fdId) => {
  router.push(`/admin/fishing-diaries/${fdId}`)
}

const viewComments = (fdId, title) => {
  selectedDiaryId.value = fdId
  selectedDiaryTitle.value = title
  loadComments(fdId)
  showCommentsModal.value = true
}

const loadComments = async (fdId) => {
  commentsLoading.value = true
  try {
    const response = await api.get(`/api/fishing-diary/${fdId}/comments`)
    
    let responseData = response.data
    if (responseData && responseData.comments) {
      selectedDiaryComments.value = responseData.comments || []
      console.log('조행기 댓글 목록:', selectedDiaryComments.value)
      if (selectedDiaryComments.value.length > 0) {
        console.log('조행기 첫 댓글:', selectedDiaryComments.value[0])
      }
    } else {
      selectedDiaryComments.value = []
      console.warn('댓글 정보가 없습니다:', responseData)
    }
  } catch (error) {
    console.error('조행기 댓글 로드 실패:', error)
    alert('조행기 댓글을 불러오는데 실패했습니다: ' + error.response?.data || error.message)
    selectedDiaryComments.value = []
  } finally {
    commentsLoading.value = false
  }
}

const deleteDiary = (fdId) => {
  diaryToDelete.value = fdId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!diaryToDelete.value) return
  
  try {
    await api.delete(`/api/admin/fishing-diary/delete/${diaryToDelete.value}`)
    alert('조행기가 삭제되었습니다.')
    await loadDiaries()
    closeDeleteModal()
  } catch (error) {
    console.error('조행기 삭제 실패:', error)
    alert('조행기 삭제에 실패했습니다: ' + error.response?.data || error.message)
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  diaryToDelete.value = null
}

const closeCommentsModal = () => {
  showCommentsModal.value = false
  selectedDiaryComments.value = []
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR')
}

const deleteComment = async (commentId) => {
  if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
    return
  }
  try {
    await api.delete(`/api/fishing-diary/comments/${commentId}`)
    alert('댓글이 삭제되었습니다.')
    await loadComments(selectedDiaryId.value)
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
    alert('댓글 삭제에 실패했습니다: ' + error.response?.data || error.message)
  }
}

const onPageSizeChange = () => {
  currentPage.value = 1
  loadDiaries()
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadDiaries()
})
</script>

<style scoped>
.fishing-diaries-admin {
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-selector label {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
}

.page-size-selector select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.page-size-selector select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.search-box input {
  padding: 0.5rem;
  border: none;
  outline: none;
  min-width: 250px;
}

.search-btn {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
}

.search-btn:hover {
  background: #2980b9;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.diaries-table {
  width: 100%;
  border-collapse: collapse;
}

.diaries-table th,
.diaries-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.diaries-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.title-cell {
  max-width: 300px;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.has-image {
  color: #3498db;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view,
.btn-comments,
.btn-delete {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-view {
  background: #3498db;
  color: white;
}

.btn-view:hover {
  background: #2980b9;
}

.btn-comments {
  background: #f39c12;
  color: white;
}

.btn-comments:hover {
  background: #e67e22;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

.loading,
.no-data {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.pagination-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
}

.page-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  color: #2c3e50;
}

.warning {
  color: #e74c3c;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.comments-modal {
  max-width: 600px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #7f8c8d;
  cursor: pointer;
}

.comments-container {
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 1rem;
  color: #7f8c8d;
}

.no-comments {
  text-align: center;
  padding: 1rem;
  color: #7f8c8d;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.comment-author {
  font-weight: 600;
}

.comment-date {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.comment-text {
  margin-top: 0.25rem;
}

.comment-actions {
  opacity: 1;
  transition: opacity 0.2s ease;
}

.btn-delete-comment {
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 0.8rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-size-selector {
    justify-content: center;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-box input {
    min-width: auto;
    flex: 1;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .pagination {
    justify-content: center;
  }
  
  .page-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .diaries-table {
    font-size: 0.8rem;
  }
  
  .diaries-table th,
  .diaries-table td {
    padding: 0.5rem;
  }
  
  .actions {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .btn-view,
  .btn-delete {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}
</style> 