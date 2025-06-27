<template>
  <div class="inquiries">
    <h2>비회원 1:1 문의</h2>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="작성자명, 이메일, 연락처로 검색">
      <select v-model="statusFilter">
        <option value="">전체 상태</option>
        <option value="pending">답변 대기</option>
        <option value="answered">답변 완료</option>
      </select>
      <select v-model="typeFilter">
        <option value="">전체 문의 유형</option>
        <option value="general">상품 문의</option>
        <option value="business">제휴 문의</option>
        <option value="system">시스템 문의</option>
        <option value="product">예약 문의</option>
        <option value="technical">예약 취소 문의</option>
      </select>
      <button @click="handleSearch">검색</button>
    </div>

    <!-- 문의 유형별 탭 -->
    <div class="inquiry-tabs">
      <button
        v-for="type in inquiryTypes"
        :key="type.value"
        :class="['tab-button', { active: selectedType === type.value }]"
        @click="selectType(type.value)"
      >
        {{ type.label }}
        <span class="tab-count">({{ getTypeCount(type.value) }})</span>
      </button>
    </div>

    <!-- 문의 목록 -->
    <div class="inquiries-list">
      <div v-for="inquiry in paginatedInquiries" :key="inquiry.id" class="inquiry-item">
        <div class="inquiry-header" @click="toggleInquiry(inquiry.id)">
          <span class="inquiry-status" :class="inquiry.status">{{ getStatusLabel(inquiry.status) }}</span>
          <h3>{{ inquiry.title }}</h3>
          <span class="inquiry-author">{{ inquiry.writer }}</span>
          <span class="inquiry-date">{{ formatDate(inquiry.createdAt) }}</span>
        </div>
        <!-- 문의 상세 펼침 영역 -->
        <div v-if="expandedInquiries.includes(inquiry.id)" class="inquiry-content">
          <div class="inquiry-info">
            <h4>문의자 정보</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>작성자:</label>
                <span>{{ inquiry.writer }}</span>
              </div>
              <div class="info-item">
                <label>이메일:</label>
                <span>{{ inquiry.email }}</span>
              </div>
              <div class="info-item">
                <label>연락처:</label>
                <span>{{ inquiry.contact }}</span>
              </div>
              <div class="info-item">
                <label>문의 유형:</label>
                <span>{{ getTypeLabel(inquiry.type) }}</span>
              </div>
            </div>
          </div>
          <div class="inquiry-message">
            <h4>문의 내용</h4>
            <p>{{ inquiry.content }}</p>
          </div>
          <!-- 답변이 있을 경우 -->
          <div v-if="inquiry.answer" class="inquiry-reply">
            <h4>답변</h4>
            <p class="reply-label">[관리자 답변]</p>
            <p class="reply-content">{{ inquiry.answer }}</p>
            <p class="reply-date">{{ formatDate(inquiry.answeredAt) }}</p>
            <div class="reply-actions">
              <button @click="editReply(inquiry.id)">수정</button>
              <button @click="deleteReply(inquiry.id)">삭제</button>
            </div>
          </div>
          <!-- 답변이 없을 경우 -->
          <div v-else class="inquiry-actions">
            <button @click="openReplyModal(inquiry.id)">답변하기</button>
            <button @click="deleteInquiry(inquiry.id)" class="btn-delete">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이징 -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="prevPage">이전</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <span class="total-info">총 {{ totalItems }}개 문의</span>
      <button :disabled="currentPage === totalPages" @click="nextPage">다음</button>
    </div>

    <!-- 답변 작성/수정 모달 -->
    <div v-if="showReplyModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingReply ? '답변 수정' : '답변 작성' }}</h2>
        <form @submit.prevent="submitAnswer">
          <div class="form-group">
            <label>답변 내용</label>
            <textarea v-model="answerContent" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit">저장</button>
            <button type="button" @click="closeModal">취소</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuestInquiries',
  data() {
    return {
      inquiries: [],
      filteredInquiries: [],
      searchQuery: '',
      statusFilter: '',
      typeFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      expandedInquiries: [],
      showReplyModal: false,
      editingReply: false,
      selectedInquiry: {},
      answerContent: '',
      selectedType: 'general',
      inquiryTypes: [
        { value: 'general', label: '상품 문의' },
        { value: 'business', label: '제휴 문의' },
        { value: 'system', label: '시스템 문의' },
        { value: 'product', label: '예약 문의' },
        { value: 'technical', label: '예약 취소 문의' }
      ]
    }
  },
  computed: {
    paginatedInquiries() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredInquiries.slice(startIndex, endIndex);
    },
    
    totalItems() {
      return this.filteredInquiries.length;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    }
  },
  mounted() {
    this.loadGuestInquiries()
  },
  methods: {
    loadGuestInquiries() {
      const key = 'guestInquiries';
      const local = JSON.parse(localStorage.getItem(key) || '[]');
      // 기존 임시 데이터와 합치려면 아래처럼 사용
      this.inquiries = [...local /*, ...기존 임시 데이터*/];
      this.filterInquiries();
    },
    async loadGuestInquiries() {
      try {
        // API 호출 로직 (실제 구현 필요)
        // const response = await this.$api.getGuestInquiries()
        // this.inquiries = response.data
        
        // 임시 데이터
        this.inquiries = [
          {
            id: 1,
            writer: '김철수',
            email: 'kim@example.com',
            contact: '010-1234-5678',
            type: 'general',
            title: '서비스 이용 문의',
            content: '서비스 이용 방법에 대해 문의드립니다.',
            status: 'pending',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            writer: '이영희',
            email: 'lee@example.com',
            contact: '010-9876-5432',
            type: 'product',
            title: '상품 관련 문의',
            content: '특정 상품에 대한 문의입니다.',
            status: 'answered',
            answer: '문의해주신 내용에 대해 답변드립니다.',
            answeredAt: '2024-01-16T14:20:00Z',
            createdAt: '2024-01-15T15:45:00Z'
          },
          {
            id: 3,
            writer: '박민수',
            email: 'park@example.com',
            contact: '010-5555-6666',
            type: 'technical',
            title: '기술 지원 문의',
            content: '웹사이트 접속이 안되는 문제가 있습니다.',
            status: 'pending',
            createdAt: '2024-01-14T09:15:00Z'
          },
          {
            id: 4,
            writer: '최지영',
            email: 'choi@example.com',
            contact: '010-7777-8888',
            type: 'product',
            title: '낚시대 추천 문의',
            content: '초보자에게 적합한 낚시대를 추천해주세요.',
            status: 'answered',
            answer: '초보자용 낚시대 추천해드립니다.',
            answeredAt: '2024-01-17T11:30:00Z',
            createdAt: '2024-01-13T16:20:00Z'
          },
          {
            id: 5,
            writer: '정현우',
            email: 'jung@example.com',
            contact: '010-9999-0000',
            type: 'general',
            title: '회원가입 문의',
            content: '회원가입 과정에서 오류가 발생합니다.',
            status: 'pending',
            createdAt: '2024-01-12T14:45:00Z'
          },
          {
            id: 6,
            writer: '한소영',
            email: 'han@example.com',
            contact: '010-1111-2222',
            type: 'technical',
            title: '앱 다운로드 오류',
            content: '모바일 앱 다운로드가 안됩니다.',
            status: 'answered',
            answer: '앱 다운로드 문제 해결 방법을 안내드립니다.',
            answeredAt: '2024-01-18T10:15:00Z',
            createdAt: '2024-01-11T13:30:00Z'
          },
          {
            id: 7,
            writer: '이파트너',
            email: 'partner@example.com',
            contact: '010-3333-4444',
            type: 'business',
            title: '제휴 문의',
            content: '파트너십 관련 문의드립니다.',
            status: 'pending',
            createdAt: '2024-01-10T10:00:00Z'
          },
          {
            id: 8,
            writer: '홍시스템',
            email: 'sys@example.com',
            contact: '010-5555-6666',
            type: 'system',
            title: '시스템 오류 문의',
            content: '로그인이 안됩니다.',
            status: 'pending',
            createdAt: '2024-01-09T09:00:00Z'
          }
        ]
        
        this.filteredInquiries = [...this.inquiries]
      } catch (error) {
        console.error('비회원 문의 로드 실패:', error)
      }
    },
    
    handleSearch() {
      this.filterInquiries()
    },
    
    filterInquiries() {
      let filtered = [...this.inquiries]
      
      // 문의 유형 필터링 (탭 선택)
      if (this.selectedType) {
        filtered = filtered.filter(inquiry => inquiry.type === this.selectedType)
      }
      
      // 검색 필터
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(inquiry => 
          inquiry.writer.toLowerCase().includes(query) ||
          inquiry.email.toLowerCase().includes(query) ||
          inquiry.contact.includes(query) ||
          inquiry.title.toLowerCase().includes(query)
        )
      }
      
      // 상태 필터
      if (this.statusFilter) {
        filtered = filtered.filter(inquiry => inquiry.status === this.statusFilter)
      }
      
      // 유형 필터 (드롭다운)
      if (this.typeFilter) {
        filtered = filtered.filter(inquiry => inquiry.type === this.typeFilter)
      }
      
      this.filteredInquiries = filtered
      this.currentPage = 1
    },
    
    getTypeLabel(type) {
      const types = {
        general: '상품 문의',
        business: '제휴 문의',
        system: '시스템 문의',
        product: '예약 문의',
        technical: '예약 취소 문의'
      }
      return types[type] || type
    },
    
    getStatusLabel(status) {
      const statuses = {
        pending: '답변 대기',
        answered: '답변 완료'
      }
      return statuses[status] || status
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    },
    
    toggleInquiry(id) {
      const index = this.expandedInquiries.indexOf(id)
      if (index === -1) {
        this.expandedInquiries.push(id)
      } else {
        this.expandedInquiries.splice(index, 1)
      }
    },
    
    openReplyModal(inquiryId) {
      this.editingReply = false
      this.selectedInquiry = this.inquiries.find(i => i.id === inquiryId)
      this.answerContent = ''
      this.showReplyModal = true
    },
    
    editReply(inquiryId) {
      const inquiry = this.inquiries.find(i => i.id === inquiryId)
      if (inquiry && inquiry.answer) {
        this.editingReply = true
        this.selectedInquiry = inquiry
        this.answerContent = inquiry.answer
        this.showReplyModal = true
      }
    },
    
    async submitAnswer() {
      if (!this.answerContent.trim()) {
        alert('답변 내용을 입력해주세요.')
        return
      }
      
      try {
        // API 호출 로직 (실제 구현 필요)
        // await this.$api.answerGuestInquiry(this.selectedInquiry.id, this.answerContent)
        
        // 임시 처리
        if (this.editingReply) {
          this.selectedInquiry.answer = this.answerContent
          alert('답변이 수정되었습니다.')
        } else {
          this.selectedInquiry.answer = this.answerContent
          this.selectedInquiry.status = 'answered'
          this.selectedInquiry.answeredAt = new Date().toISOString()
          alert('답변이 등록되었습니다.')
        }
        
        // 목록 업데이트
        const index = this.inquiries.findIndex(i => i.id === this.selectedInquiry.id)
        if (index !== -1) {
          this.inquiries[index] = { ...this.selectedInquiry }
        }
        
        this.filterInquiries()
        this.closeModal()
        this.$router.push('/admin/guest-inquiries')
      } catch (error) {
        console.error('답변 등록 실패:', error)
        alert('답변 등록에 실패했습니다.')
      }
    },
    
    async deleteReply(inquiryId) {
      if (!confirm('정말 삭제하시겠습니까?')) return
      
      try {
        // API 호출 로직 (실제 구현 필요)
        // await this.$api.deleteGuestInquiryReply(inquiryId)
        
        // 임시 처리
        const inquiry = this.inquiries.find(i => i.id === inquiryId)
        if (inquiry) {
          inquiry.answer = null
          inquiry.status = 'pending'
          inquiry.answeredAt = null
          alert('답변이 삭제되었습니다.')
        }
      } catch (error) {
        console.error('답변 삭제 실패:', error)
        alert('답변 삭제에 실패했습니다.')
      }
    },
    
    async deleteInquiry(id) {
      if (!confirm('정말 삭제하시겠습니까?')) return
      
      try {
        // API 호출 로직 (실제 구현 필요)
        // await this.$api.deleteGuestInquiry(id)
        
        // 임시 처리
        this.inquiries = this.inquiries.filter(inquiry => inquiry.id !== id)
        this.filterInquiries()
        alert('문의가 삭제되었습니다.')
      } catch (error) {
        console.error('문의 삭제 실패:', error)
        alert('문의 삭제에 실패했습니다.')
      }
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    
    closeModal() {
      this.showReplyModal = false
      this.selectedInquiry = {}
      this.answerContent = ''
      this.editingReply = false
    },
    
    selectType(type) {
      this.selectedType = type
      this.currentPage = 1
      this.filterInquiries()
    },
    
    getTypeCount(type) {
      return this.inquiries.filter(inquiry => inquiry.type === type).length
    },
    
    saveToLocalStorage(inquiry) {
      const key = 'guestInquiries';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.unshift(inquiry); // 최신순 정렬
      localStorage.setItem(key, JSON.stringify(prev));
    },
    
    async submitForm() {
      try {
        // ... 기존 코드 ...
        const inquiryData = {
          ...this.form,
          content: content,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        this.saveToLocalStorage(inquiryData);
        // ... 기존 코드 ...
      } catch (error) {
        // ... 기존 코드 ...
      }
    }
  }
}
</script>

<style scoped>
.inquiries {
  padding: 1rem;
}

.inquiries h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 24px;
}

.inquiries p {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
}

.search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.inquiry-tabs {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  color: #666;
}

.tab-button:hover {
  background-color: #e9ecef;
  color: #333;
}

.tab-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #007bff;
}

.tab-count {
  font-size: 0.875rem;
  margin-left: 0.5rem;
  opacity: 0.8;
}

.tab-button.active .tab-count {
  color: rgba(255, 255, 255, 0.8);
}

.inquiries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.inquiry-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.inquiry-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  background-color: #f8f9fa;
}

.inquiry-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: white;
}

.inquiry-status.pending {
  background-color: #e74c3c;
}

.inquiry-status.answered {
  background-color: #2ecc71;
}

.inquiry-header h3 {
  margin: 0;
  flex: 1;
}

.inquiry-author {
  color: #666;
  font-size: 0.875rem;
}

.inquiry-date {
  color: #666;
  font-size: 0.875rem;
}

.inquiry-content {
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.inquiry-info,
.inquiry-message,
.inquiry-reply {
  margin-bottom: 1rem;
}

.inquiry-info h4,
.inquiry-message h4,
.inquiry-reply h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 5px;
  font-size: 14px;
}

.inquiry-message p,
.inquiry-reply p {
  margin: 0 0 1rem;
  color: #666;
}

.reply-label {
  font-weight: 600;
  color: #3498db;
}

.reply-date {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.inquiry-actions,
.reply-actions {
  display: flex;
  gap: 0.5rem;
}

.inquiry-actions button,
.reply-actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.inquiry-actions button {
  background-color: #3498db;
}

.inquiry-actions .btn-delete {
  background-color: #e74c3c;
}

.reply-actions button:first-child {
  background-color: #f1c40f;
}

.reply-actions button:last-child {
  background-color: #e74c3c;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination button:disabled {
  background-color: #f8f9fa;
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #333;
  min-width: 60px;
  text-align: center;
}

.total-info {
  color: #666;
  font-size: 0.9rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal-content h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 200px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: #2ecc71;
  color: white;
}

.form-actions button[type="button"] {
  background-color: #95a5a6;
  color: white;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .inquiry-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .inquiry-actions,
  .reply-actions {
    flex-direction: column;
  }
}
</style> 