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
      </div>
    </div>
    
    <!-- 공지사항 목록 -->
    <div class="notices-table">
      <div class="table-header">
        <div class="col-id" style="color: white;">번호</div>
        <div class="col-title" style="color: white;">제목</div>
        <div class="col-author" style="color: white;">작성자</div>
        <div class="col-date" style="color: white;">작성일</div>
        <div class="col-actions" style="color: white;">관리</div>
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
              <i v-if="notice.isTop" class="fas fa-star title-icon top-icon" title="고정공지"></i>
              <span class="title-content" :class="{ 'with-badge': notice.isTop }">
                {{ notice.title }}
              </span>
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
              <i class="fa-solid fa-xmark"></i>
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
          
          <div class="form-group">
            <label>썸네일 URL</label>
            <input 
              type="text" 
              v-model="noticeForm.thumbnailUrl" 
              placeholder="썸네일 URL을 입력하세요"
            >
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="noticeForm.isTop">
              <span class="checkmark"></span>
              상단 고정
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
          <div class="notice-content">
            <p>{{ selectedNotice.content }}</p>
          </div>
          <div class="notice-meta">
            <span>작성자: {{ selectedNotice.adminName || '관리자' }}</span>
            <span>작성일: {{ formatDate(selectedNotice.createdAt) }}</span>
            <span v-if="selectedNotice.modifyAt">수정일: {{ formatDate(selectedNotice.modifyAt) }}</span>
            <span>조회수: {{ selectedNotice.views || 0 }}</span>
            <span v-if="selectedNotice.isTop">상단고정: 예</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getAdminNotices, createNotice, updateNotice, deleteNotice as deleteNoticeApi, fetchNoticeById } from '@/api/notice.js'

export default {
  name: 'Notices',
  setup() {
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
      page: 0,
      size: 10
    })
    
    const noticeForm = ref({
      title: '',
      content: '',
      thumbnailUrl: '',
      isTop: false
    })
    
    const loadNotices = async () => {
      loading.value = true
      try {
        const params = { 
          page: currentPage.value,
          size: 10,
          keyword: searchParams.value.keyword,
          type: searchParams.value.type
        }
        
        // 빈 값 제거
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })
        
        const res = await getAdminNotices(params)
        
        // Spring Boot 페이징 응답 구조에 맞게 처리
        if (res.data && res.data.content) {
          notices.value = res.data.content
          totalPages.value = res.data.totalPages
          currentPage.value = res.data.number
        } else {
          notices.value = res.data || []
          totalPages.value = 1
          currentPage.value = 0
        }
      } catch (error) {
        console.error('공지사항 목록 로드 실패:', error)
        // 에러 시 임시 데이터 표시
        notices.value = [
          {
            noticeId: 1,
            title: '시스템 점검 안내',
            content: '정기 시스템 점검이 예정되어 있습니다.',
            thumbnailUrl: null,
            createdAt: '2024-01-15T10:00:00',
            modifyAt: null,
            views: 0,
            isTop: true,
            adminName: '관리자'
          }
        ]
        totalPages.value = 1
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
        // 에러 시 목록에서 찾기
        selectedNotice.value = notices.value.find(notice => notice.noticeId === noticeId)
        showDetailModal.value = true
      }
    }
    
    const editNotice = (notice) => {
      isEditing.value = true
      noticeForm.value = {
        noticeId: notice.noticeId,
        title: notice.title,
        content: notice.content,
        thumbnailUrl: notice.thumbnailUrl || '',
        isTop: notice.isTop || false
      }
      showEditModal.value = true
    }
    
    const toggleTop = async (notice) => {
      try {
        await updateNotice(notice.noticeId, {
          title: notice.title,
          content: notice.content,
          thumbnailUrl: notice.thumbnailUrl,
          isTop: !notice.isTop
        })
        await loadNotices()
      } catch (error) {
        console.error('고정 상태 변경 실패:', error)
        alert('고정 상태 변경에 실패했습니다.')
      }
    }
    
    const deleteNotice = async (noticeId) => {
      if (!confirm('정말 삭제하시겠습니까?')) return
      
      try {
        await deleteNoticeApi(noticeId)
        await loadNotices()
        alert('공지사항이 삭제되었습니다.')
      } catch (error) {
        console.error('공지사항 삭제 실패:', error)
        alert('공지사항 삭제에 실패했습니다.')
      }
    }
    
    const submitNotice = async () => {
      submitting.value = true
      try {
        const noticeData = {
          title: noticeForm.value.title.trim(),
          content: noticeForm.value.content.trim(),
          thumbnailUrl: noticeForm.value.thumbnailUrl || null,
          isTop: noticeForm.value.isTop
        }
        
        if (isEditing.value) {
          await updateNotice(noticeForm.value.noticeId, noticeData)
          alert('공지사항이 수정되었습니다.')
        } else {
          await createNotice(noticeData)
          alert('공지사항이 등록되었습니다.')
        }
        closeModal()
        await loadNotices()
      } catch (error) {
        console.error('공지사항 저장 실패:', error)
        if (error.response && error.response.data) {
          // 백엔드에서 보낸 에러 메시지 표시
          const errorMessages = error.response.data
          if (Array.isArray(errorMessages)) {
            alert('입력 오류:\n' + errorMessages.map(err => err.defaultMessage).join('\n'))
          } else {
            alert('공지사항 저장에 실패했습니다.')
          }
        } else {
          alert('공지사항 저장에 실패했습니다.')
        }
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
        thumbnailUrl: '',
        isTop: false
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
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.search-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  display: flex;
  position: relative;
}

.search-box input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
}

.filter-box {
  display: flex;
  gap: 0.5rem;
}

.filter-box select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px 120px;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px 120px;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
  align-items: center;
  color: #1e293b;
  font-size: 0.95rem;
}

.table-row:hover {
  background-color: #f8fafc;
}

.col-id {
  font-weight: 600;
  color: #64748b;
  text-align: center;
}

.col-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.col-author, .col-date {
  color: #64748b;
  font-weight: 500;
  text-align: center;
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

.action-btn.edit { background-color: #f59e0b; }
.action-btn.delete { background-color: #ef4444; }
.action-btn.edit:hover, .action-btn.delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
    grid-template-columns: 60px 1fr 80px 80px 80px;
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
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