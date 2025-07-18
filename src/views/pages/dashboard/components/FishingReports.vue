<template>
  <div class="fishing-reports-admin">
    <div class="header">
      <h2>조황정보 관리</h2>
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
          <div class="stat-number">{{ totalReports }}</div>
          <div class="stat-label">전체 조황정보</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ todayReports }}</div>
          <div class="stat-label">오늘 등록</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ thisWeekReports }}</div>
          <div class="stat-label">이번 주 등록</div>
        </div>
      </div>

      <div class="table-container">
        <table class="reports-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>낚시 날짜</th>
              <th>상품명</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in paginatedReports" :key="report.frId">
              <td>{{ report.frId }}</td>
              <td class="title-cell">
                <div class="title-content">
                  <span class="title">{{ report.title }}</span>
                  <span v-if="report.thumbnailUrl" class="has-image">
                    <i class="fas fa-image"></i>
                  </span>
                </div>
              </td>
              <td>{{ report.user?.nickname || '알 수 없음' }}</td>
              <td>{{ formatDate(report.fishingAt) }}</td>
              <td>{{ report.prodName || '-' }}</td>
              <td>{{ formatDateTime(report.createdAt) }}</td>
              <td class="actions">
                <button @click="viewReport(report.frId)" class="btn-view">
                  보기
                </button>
                <button @click="viewComments(report.frId, report.title)" class="btn-comments">
                  댓글
                </button>
                <button @click="deleteReport(report.frId)" class="btn-delete">
                  <i class="fa-solid fa-x"></i> 삭제
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> 로딩 중...
        </div>

        <div v-if="!loading && (!Array.isArray(reports) || reports.length === 0)" class="no-data">
          조황정보가 없습니다.
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-container" v-if="totalPages > 1">
        <div class="pagination-info">
          총 {{ totalElements }}개의 조황정보 중 {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalElements) }}번째
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
        <h3>조황정보 삭제</h3>
        <p>정말로 이 조황정보를 삭제하시겠습니까?</p>
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
          <h3>{{ selectedReportTitle }} - 댓글 관리</h3>
          <button @click="closeCommentsModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="comments-container">
          <div v-if="commentsLoading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> 댓글을 불러오는 중...
          </div>
          
          <div v-else-if="selectedReportComments.length === 0" class="no-comments">
            <i class="fas fa-comment-slash"></i>
            <p>등록된 댓글이 없습니다.</p>
          </div>
          
          <div v-else class="comments-list">
            <div v-for="comment in selectedReportComments" :key="comment.frCommentId" class="comment-item">
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.user?.nickname || '알 수 없음' }}</span>
                  <span class="comment-date">{{ formatDateTime(comment.createdAt) }}</span>
                </div>
                <div class="comment-text">{{ comment.comment }}</div>
              </div>
              <div class="comment-actions">
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
import { partnerService } from '@/api/partner'

const router = useRouter()

// 상태 관리
const reports = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showDeleteModal = ref(false)
const reportToDelete = ref(null)

// 댓글 관리 상태
const showCommentsModal = ref(false)
const selectedReportComments = ref([])
const selectedReportTitle = ref('')
const selectedReportId = ref(null)
const commentsLoading = ref(false)

// 서버 사이드 페이징을 위한 상태
const totalPages = ref(1)
const totalElements = ref(0)
const hasNext = ref(false)
const hasPrevious = ref(false)

// 통계 데이터
const totalReports = ref(0)
const todayReports = ref(0)
const thisWeekReports = ref(0)

// 계산된 속성
const filteredReports = computed(() => {
  if (!Array.isArray(reports.value)) {
    return []
  }
  
  if (!searchQuery.value) return reports.value
  
  const query = searchQuery.value.toLowerCase()
  return reports.value.filter(report => 
    report.title && report.title.toLowerCase().includes(query) ||
    (report.user?.nickname && report.user.nickname.toLowerCase().includes(query))
  )
})

const paginatedReports = computed(() => {
  if (!Array.isArray(reports.value)) {
    return []
  }
  return reports.value
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
const loadReports = async (page = 1) => {
  loading.value = true
  try {
    // 페이징 파라미터 추가
    const params = {
      page: page - 1, // 백엔드는 0-based index 사용
      size: itemsPerPage.value
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    // partnerService 사용
    const response = await partnerService.getFishingReports(params)
    let responseData = response.data

    // 이하 기존 로직 동일
    if (responseData && responseData.content) {
      reports.value = responseData.content || []
      totalPages.value = responseData.totalPages || 1
      totalElements.value = responseData.totalElements || 0
      hasNext.value = responseData.hasNext || false
      hasPrevious.value = responseData.hasPrevious || false
    } else if (Array.isArray(responseData)) {
      reports.value = responseData
      totalPages.value = 1
      totalElements.value = responseData.length
      hasNext.value = false
      hasPrevious.value = false
    } else {
      reports.value = []
      totalPages.value = 1
      totalElements.value = 0
      hasNext.value = false
      hasPrevious.value = false
      console.warn('예상하지 못한 응답 구조:', responseData)
    }
    totalReports.value = totalElements.value
    
    // 오늘 등록된 조황정보 수 계산 (클라이언트에서 계산)
    const today = new Date().toISOString().split('T')[0]
    todayReports.value = reports.value.filter(report => 
      report.createdAt && report.createdAt.startsWith(today)
    ).length
    
    // 이번 주 등록된 조황정보 수 계산 (클라이언트에서 계산)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    thisWeekReports.value = reports.value.filter(report => 
      report.createdAt && new Date(report.createdAt) >= weekAgo
    ).length

  } catch (error) {
    console.error('조황정보 로드 실패:', error)
    alert('조황정보를 불러오는데 실패했습니다.')
    reports.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadReports(1)
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadReports(page)
  }
}

const viewReport = (frId) => {
  router.push(`/admin/fishing-reports/${frId}`)
}

const viewComments = (frId, title) => {
  selectedReportId.value = frId
  selectedReportTitle.value = title
  loadComments(frId)
  showCommentsModal.value = true
}

const loadComments = async (frId) => {
  commentsLoading.value = true
  try {
    const response = await partnerService.getFishingReportComments(frId)
    let responseData = response.data
    if (responseData && responseData.comments) {
      selectedReportComments.value = responseData.comments || []
      console.log('조황정보 댓글 목록:', selectedReportComments.value)
      if (selectedReportComments.value.length > 0) {
        console.log('조황정보 첫 댓글:', selectedReportComments.value[0])
      }
    } else {
      selectedReportComments.value = []
      console.warn('댓글 정보가 없습니다:', responseData)
    }
  } catch (error) {
    console.error('조황정보 댓글 로드 실패:', error)
    alert('조황정보 댓글을 불러오는데 실패했습니다.')
    selectedReportComments.value = []
  } finally {
    commentsLoading.value = false
  }
}

const deleteComment = async (commentId) => {
  if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
    return
  }
  try {
    await partnerService.deleteFishingReportComment(commentId)
    alert('댓글이 삭제되었습니다.')
    await loadComments(selectedReportId.value)
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
    alert('댓글 삭제에 실패했습니다.')
  }
}

const closeCommentsModal = () => {
  showCommentsModal.value = false
  selectedReportComments.value = []
}

const deleteReport = (frId) => {
  reportToDelete.value = frId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!reportToDelete.value) return
  
  try {
    await partnerService.deleteFishingReport(reportToDelete.value)
    alert('조황정보가 삭제되었습니다.')
    await loadReports()
    closeDeleteModal()
  } catch (error) {
    console.error('조황정보 삭제 실패:', error)
    alert('조황정보 삭제에 실패했습니다.')
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  reportToDelete.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR')
}

const onPageSizeChange = () => {
  currentPage.value = 1
  loadReports(1)
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.fishing-reports-admin {
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

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th,
.reports-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.reports-table th {
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

.btn-comments {
  background: #f39c12;
  color: white;
}

.btn-comments:hover {
  background: #e67e22;
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
  display: flex;
  gap: 0.5rem;
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
  
  .reports-table {
    font-size: 0.8rem;
  }
  
  .reports-table th,
  .reports-table td {
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