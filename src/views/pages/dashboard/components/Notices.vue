<template>
  <div class="notices-container">
    <div class="header">
      <h1>공지사항 관리</h1>
      <button @click="showCreateModal = true" class="create-btn">
        <i class="fas fa-plus"></i> 새 공지사항 작성
      </button>
    </div>
    
    <!-- 검색 및 필터 -->
    <div class="search-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchParams.keyword" 
          placeholder="제목 또는 내용으로 검색"
          @keyup.enter="loadNotices"
        >
        <button @click="loadNotices" class="search-btn">
          <i class="fas fa-search"></i>
        </button>
      </div>
      <div class="filter-box">
        <select v-model="searchParams.type" @change="loadNotices">
          <option value="">전체</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="title+content">제목+내용</option>
        </select>
        <select v-model="searchParams.isTop" @change="loadNotices">
          <option value="">전체</option>
          <option value="true">고정공지</option>
          <option value="false">일반공지</option>
        </select>
      </div>
    </div>
    
    <!-- 공지사항 목록 -->
    <div class="notices-table">
      <div class="table-header">
        <div class="col-id">번호</div>
        <div class="col-title">제목</div>
        <div class="col-status">상태</div>
        <div class="col-author">작성자</div>
        <div class="col-date">작성일</div>
        <div class="col-actions">관리</div>
      </div>
      
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>공지사항을 불러오는 중...</p>
      </div>
      
      <div v-else-if="notices.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>등록된 공지사항이 없습니다.</p>
      </div>
      
      <div v-else class="table-body">
        <div 
          v-for="notice in notices" 
          :key="notice.noticeId" 
          class="table-row"
        >
          <div class="col-id">{{ notice.noticeId }}</div>
          <div class="col-title" @click="viewNotice(notice.noticeId)" style="cursor: pointer;">
            <span class="title-text">
              <span v-if="notice.isTop" class="badge top">고정</span>
              <span v-if="notice.isUrgent" class="badge urgent">긴급</span>
              <i v-if="notice.isTop" class="fas fa-star title-icon top-icon" title="고정공지"></i>
              <i v-if="notice.isUrgent" class="fas fa-exclamation-triangle title-icon urgent-icon" title="긴급공지"></i>
              <span class="title-content" :class="{ 'with-badge': notice.isTop || notice.isUrgent }">
                {{ notice.title }}
              </span>
            </span>
          </div>
          <div class="col-status">
            <span :class="['status', notice.isActive ? 'active' : 'inactive']">
              {{ notice.isActive ? '활성' : '비활성' }}
            </span>
          </div>
          <div class="col-author">{{ notice.adminName || '관리자' }}</div>
          <div class="col-date">{{ formatDate(notice.createdAt) }}</div>
          <div class="col-actions">
            <button @click="editNotice(notice)" class="action-btn edit" title="수정">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="toggleTop(notice)" class="action-btn" :class="notice.isTop ? 'top-active' : 'top'" :title="notice.isTop ? '고정해제' : '고정'">
              <i class="fas fa-star"></i>
            </button>
            <button @click="deleteNotice(notice.noticeId)" class="action-btn delete" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 페이징 -->
    <div class="pagination">
      <button 
        :disabled="currentPage === 0" 
        @click="changePage(currentPage - 1)"
        class="page-btn"
      >
        <i class="fas fa-chevron-left"></i> 이전
      </button>
      <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button 
        :disabled="currentPage >= totalPages - 1" 
        @click="changePage(currentPage + 1)"
        class="page-btn"
      >
        다음 <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 공지사항 작성/수정 모달 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? '공지사항 수정' : '공지사항 작성' }}</h2>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="submitNotice" class="modal-form">
          <div class="form-group">
            <label>제목 *</label>
            <input 
              type="text" 
              v-model="noticeForm.title" 
              required
              placeholder="공지사항 제목을 입력하세요"
            >
          </div>
          
          <div class="form-group">
            <label>내용 *</label>
            <textarea 
              v-model="noticeForm.content" 
              required
              rows="10"
              placeholder="공지사항 내용을 입력하세요"
            ></textarea>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="noticeForm.isTop">
              <span class="checkmark"></span>
              상단 고정
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="noticeForm.isUrgent">
              <span class="checkmark"></span>
              긴급 공지
            </label>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="submitting">
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              {{ isEditing ? '수정' : '등록' }}
            </button>
            <button type="button" @click="closeModal" class="cancel-btn">취소</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 공지사항 상세보기 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>공지사항 상세보기</h2>
          <button @click="closeDetailModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="notice-detail">
          <h3>{{ selectedNotice.title }}</h3>
          <p>{{ selectedNotice.content }}</p>
          <div class="notice-meta">
            <span>작성자: {{ selectedNotice.adminName || '관리자' }}</span>
            <span>작성일: {{ formatDate(selectedNotice.createdAt) }}</span>
            <span>상태: {{ selectedNotice.isActive ? '활성' : '비활성' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { fetchNotices, createNotice, updateNotice, deleteNotice, fetchNoticeById } from '@/api/noticeApi.js'
import { useAdminAuthStore } from '@/store/auth/auth.js'

export default {
  name: 'Notices',
  setup() {
    const authStore = useAdminAuthStore()
    
    const notices = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const currentPage = ref(0)
    const totalPages = ref(0)
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const isEditing = ref(false)
    const showDetailModal = ref(false)
    const selectedNotice = ref(null)
    
    const searchParams = ref({
      keyword: '',
      type: '',
      isTop: '',
      page: 0,
      size: 10
    })
    
    const noticeForm = ref({
      title: '',
      content: '',
      isTop: false,
      isUrgent: false
    })
    
    const loadNotices = async () => {
      loading.value = true
      try {
        const params = { ...searchParams.value, page: currentPage.value }
        const res = await fetchNotices(params)
        notices.value = res.data.content
        totalPages.value = res.data.totalPages
      } catch (error) {
        console.error('공지사항 목록 로드 실패:', error)
      } finally {
        loading.value = false
      }
    }
    
    const changePage = (page) => {
      currentPage.value = page
      loadNotices()
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('ko-KR')
    }
    
    const viewNotice = async (noticeId) => {
      try {
        const { data } = await fetchNoticeById(noticeId)
        selectedNotice.value = data
        showDetailModal.value = true
      } catch (error) {
        console.error('공지사항 상세 조회 실패:', error)
      }
    }
    
    const editNotice = (notice) => {
      isEditing.value = true
      noticeForm.value = {
        title: notice.title,
        content: notice.content,
        isTop: notice.isTop || false,
        isUrgent: notice.isUrgent || false
      }
      showEditModal.value = true
    }
    
    const toggleTop = async (notice) => {
      try {
        await updateNotice(notice.noticeId, {
          ...notice,
          isTop: !notice.isTop
        }, authStore.token)
        await loadNotices()
      } catch (error) {
        console.error('고정 상태 변경 실패:', error)
      }
    }
    
    const deleteNotice = async (noticeId) => {
      if (!confirm('정말 삭제하시겠습니까?')) return
      
      try {
        await deleteNotice(noticeId, authStore.token)
        await loadNotices()
      } catch (error) {
        console.error('공지사항 삭제 실패:', error)
      }
    }
    
    const submitNotice = async () => {
      submitting.value = true
      try {
        if (isEditing.value) {
          await updateNotice(noticeForm.value.noticeId, noticeForm.value, authStore.token)
        } else {
          await createNotice(noticeForm.value, authStore.token)
        }
        closeModal()
        await loadNotices()
      } catch (error) {
        console.error('공지사항 저장 실패:', error)
      } finally {
        submitting.value = false
      }
    }
    
    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      isEditing.value = false
      noticeForm.value = {
        title: '',
        content: '',
        isTop: false,
        isUrgent: false
      }
    }

    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedNotice.value = null
    }
    
    onMounted(() => {
      loadNotices()
    })
    
    return {
      notices,
      loading,
      submitting,
      currentPage,
      totalPages,
      showCreateModal,
      showEditModal,
      isEditing,
      showDetailModal,
      selectedNotice,
      searchParams,
      noticeForm,
      loadNotices,
      changePage,
      formatDate,
      viewNotice,
      editNotice,
      toggleTop,
      deleteNotice,
      submitNotice,
      closeModal,
      closeDetailModal
    }
  }
}
</script>

<style scoped>
.notices-container {
  padding: 1.5rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 700;
}

.create-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.35);
}

.search-section {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  min-width: 300px;
}

.search-box input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn {
  padding: 0.75rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background: #5a67d8;
}

.filter-box {
  display: flex;
  gap: 0.5rem;
}

.filter-box select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-box select:focus {
  outline: none;
  border-color: #667eea;
}

.notices-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 1fr 1fr 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 1fr 1fr 150px;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
  align-items: center;
}

.table-row:hover {
  background-color: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.col-id {
  font-weight: 600;
  color: #64748b;
}

.col-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-text {
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.top-icon {
  color: #fbbf24;
}

.urgent-icon {
  color: #ef4444;
}

.col-title:hover .title-text {
  color: #667eea;
  text-decoration: underline;
}

.title-content {
  display: inline-block;
  min-width: 0;
  flex: 1;
}

.title-content.with-badge {
  margin-left: 0;
}

.title-content:not(.with-badge) {
  margin-left: 60px; /* 배지와 아이콘 공간만큼 들여쓰기 */
}

.title-badges {
  display: flex;
  gap: 0.25rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.top {
  background-color: #3b82f6;
  color: white;
}

.badge.urgent {
  background-color: #ef4444;
  color: white;
}

.col-status {
  display: flex;
  align-items: center;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.active {
  background-color: #dcfce7;
  color: #166534;
}

.status.inactive {
  background-color: #fef2f2;
  color: #dc2626;
}

.col-author {
  color: #64748b;
  font-weight: 500;
}

.col-date {
  color: #64748b;
  font-size: 0.9rem;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: white;
  font-size: 0.9rem;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-btn.edit {
  background-color: #f59e0b;
}

.action-btn.top {
  background-color: #6b7280;
}

.action-btn.top-active {
  background-color: #fbbf24;
}

.action-btn.delete {
  background-color: #ef4444;
}

.loading, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
}

.loading i, .empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.empty-state i {
  color: #cbd5e0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  background-color: #f8fafc;
  color: #cbd5e0;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #64748b;
  min-width: 80px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #e2e8f0;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.checkbox-group {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  padding: 0.75rem 2rem;
  background: #f1f5f9;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

/* 상세보기 모달 스타일 */
.notice-detail {
  padding: 1rem 0;
}

.notice-detail h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.4;
}

.notice-detail p {
  margin: 0 0 1.5rem 0;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.notice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.notice-meta span {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .notices-container {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-section {
    flex-direction: column;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-box {
    justify-content: stretch;
  }
  
  .filter-box select {
    flex: 1;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 80px 80px 100px 120px;
    font-size: 0.8rem;
  }
  
  .col-actions {
    gap: 0.25rem;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style> 