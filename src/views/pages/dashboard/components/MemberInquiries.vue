<template>
  <div class="MemberInquiries">
    <h2>회원 1:1 문의</h2>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="제목 또는 작성자로 검색">
      <select v-model="statusFilter">
        <option value="">전체 상태</option>
        <option value="대기중">대기중</option>
        <option value="답변완료">답변완료</option>
      </select>
      <button @click="searchInquiries">검색</button>
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
          <span class="answer-badge" :class="inquiry.answerContent ? 'badge-complete' : 'badge-pending'">
            <span class="dot"></span>
            {{ inquiry.answerContent ? '답변완료' : '답변대기' }}
          </span>
          <span class="inquiry-status" :class="inquiry.status">{{ inquiry.status }}</span>
          <h3>{{ inquiry.title }}</h3>
          <span class="inquiry-author">{{ inquiry.userName || inquiry.author }}</span>
          <span class="inquiry-date">{{ formatDate(inquiry.createdAt) }}</span>
        </div>
        <!-- 문의 상세 펼침 영역 -->
        <div v-if="expandedInquiries.includes(inquiry.id)" class="inquiry-content">
          <div class="inquiry-message">
            <h4>문의 내용</h4>
            <p>{{ inquiry.content }}</p>
          </div>
          <!-- 답변이 있을 경우 -->
          <div v-if="inquiry.answerContent" class="inquiry-reply">
            <h4>답변</h4>
            <p class="reply-label">[관리자 답변]</p>
            <p class="reply-content">{{ inquiry.answerContent }}</p>
            <p class="reply-date">{{ formatDate(inquiry.answeredAt) }}</p>
            <div class="reply-actions">
              <button @click="editReply(inquiry.id)">수정</button>
              <button @click="deleteReply(inquiry.id)">삭제</button>
            </div>
          </div>
          <!-- 답변이 없을 경우 -->
          <div v-else class="inquiry-actions">
            <button @click="openReplyModal(inquiry.id)">답변하기</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이징 -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <span class="total-info">총 {{ totalItems }}개 문의</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 답변 작성/수정 모달 -->
    <div v-if="showReplyModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingReply ? '답변 수정' : '답변 작성' }}</h2>
        <form @submit.prevent="submitReply">
          <div class="form-group">
            <label>답변 내용</label>
            <textarea v-model="replyForm.content" required></textarea>
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
import {inquiryApi} from '@/api/inquiry'

export default {
  name: 'Inquiries',
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      inquiries: [],
      expandedInquiries: [],
      currentPage: 1,
      itemsPerPage: 10,
      showReplyModal: false,
      editingReply: false,
      replyForm: {
        inquiryId: null,
        content: ''
      },
      inquiryTypes: [
        { value: 'PRODUCT', label: '상품 문의' },
        { value: 'PARTNERSHIP', label: '제휴 문의' },
        { value: 'SYSTEM', label: '시스템 문의' },
        { value: 'RESERVATION', label: '예약 문의' },
        { value: 'RESERVATION_CANCEL', label: '예약 취소 문의' }
      ],
      selectedType: 'PRODUCT' // 기본값으로 상품 문의 선택
    }
  },
  computed: {
    groupedInquiries() {
      const groups = {
        'PRODUCT': [],
        'PARTNERSHIP': [],
        'SYSTEM': [],
        'RESERVATION': [],
        'RESERVATION_CANCEL': []
      };

      for (const inquiry of this.inquiries) {
        const type = inquiry.inquiryType || this.getInquiryTypeFromTitle(inquiry.title);
        if (groups[type]) {
          groups[type].push(inquiry);
        } else {
          groups['SYSTEM'].push(inquiry); // 기본값
        }
      }
      return groups;
    },
    filteredInquiries() {
      let filtered = this.inquiries;

      // 문의 유형 필터링
      if (this.selectedType) {
        filtered = filtered.filter(inquiry => {
          const type = inquiry.inquiryType || this.getInquiryTypeFromTitle(inquiry.title);
          return type === this.selectedType;
        });
      }

      // 검색어 필터링
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(inquiry =>
          inquiry.title.toLowerCase().includes(query) ||
          (inquiry.userName || inquiry.author || '').toLowerCase().includes(query)
        );
      }

      // 상태 필터링
      if (this.statusFilter) {
        filtered = filtered.filter(inquiry => inquiry.status === this.statusFilter);
      }

      return filtered;
    },
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
  methods: {
    async searchInquiries() {
      try {
        const params = {
          keyword: this.searchQuery || '',
          status: this.statusFilter || '',
          inquiryType: this.selectedType || '',
          page: this.currentPage - 1,
          size: this.itemsPerPage
        };
        const response = await inquiryApi.getInquiryList(params);
        this.inquiries = response.data.content || response.data;
        
        // 펼침 상태 초기화
        this.expandedInquiries = [];
      } catch (error) {
        console.error('문의 목록 조회 실패:', error);
        // API 호출 실패 시 빈 배열로 초기화
        this.inquiries = [];
        this.expandedInquiries = [];
      }
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
      this.replyForm.inquiryId = inquiryId
      this.replyForm.content = ''
      this.showReplyModal = true
    },
    editReply(inquiryId) {
      const inquiry = this.inquiries.find(i => i.id === inquiryId)
      if (inquiry && inquiry.answerContent) {
        this.editingReply = true
        this.replyForm.inquiryId = inquiryId
        this.replyForm.content = inquiry.answerContent
        this.showReplyModal = true
      }
    },
    async deleteReply(inquiryId) {
      if (!confirm('정말 삭제하시겠습니까?')) return;
      try {
        await inquiryApi.deleteReply(inquiryId);
        alert('답변이 삭제되었습니다.');
        this.searchInquiries();
      } catch (error) {
        console.error('답변 삭제 실패:', error);
        alert('답변 삭제 중 오류가 발생했습니다.');
      }
    },
    async submitReply() {
      try {
        const {inquiryId, content} = this.replyForm;

        if (this.editingReply) {
          await inquiryApi.updateReply(inquiryId, {answerContent: content});
          alert('답변이 수정되었습니다.');
        } else {
          await inquiryApi.createReply(inquiryId, {answerContent: content});
          alert('답변이 등록되었습니다.');
        }

        this.showReplyModal = false;
        this.replyForm = { inquiryId: null, content: '' };

        // 목록 새로고침
        await this.searchInquiries();

      } catch (error) {
        console.error('답변 저장 실패:', error);
        alert('답변 저장 중 오류가 발생했습니다.');
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    },
    selectType(type) {
      this.selectedType = type;
      this.currentPage = 1; // 페이지 초기화
      this.searchInquiries();
    },
    closeModal() {
      this.showReplyModal = false;
      this.replyForm = { inquiryId: null, content: '' };
      this.editingReply = false;
    },
    getTypeCount(type) {
      // 현재 필터(검색, 상태 등)가 적용된 데이터에서만 개수 세기
      return this.filteredInquiries.filter(inquiry => {
        const t = inquiry.inquiryType || this.getInquiryTypeFromTitle(inquiry.title);
        return t === type;
      }).length;
    },
    getInquiryTypeFromTitle(title) {
      const words = title.split(' ');
      if (words.length > 0) {
        const firstWord = words[0].toLowerCase();
        if (firstWord === '상품') return 'PRODUCT';
        if (firstWord === '제휴') return 'PARTNERSHIP';
        if (firstWord === '시스템') return 'SYSTEM';
        if (firstWord === '예약') return 'RESERVATION';
        if (firstWord === '취소') return 'RESERVATION_CANCEL';
      }
      return 'SYSTEM'; // 기본값
    },
  },
  created() {
    this.searchInquiries()
  },
  mounted() {
    // 라우터 쿼리 파라미터에서 문의 유형 확인
    const queryType = this.$route.query.type;
    if (queryType && this.inquiryTypes.some(type => type.value === queryType)) {
      this.selectedType = queryType;
      this.searchInquiries();
    }
  }
}
</script>

<style scoped>
.inquiries {
  padding: 1rem;
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

.answer-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 700;
  margin-right: 1rem;
  padding: 0.25rem 0.8rem 0.25rem 0.5rem;
  border-radius: 16px;
  background: #f8f9fa;
  border: 1.5px solid #eee;
  min-width: 90px;
  justify-content: left;
}

.answer-badge .dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 7px;
}

.badge-pending {
  color: #e74c3c;
  border-color: #e74c3c;
}

.badge-pending .dot {
  background: #e74c3c;
}

.badge-complete {
  color: #2ecc71;
  border-color: #2ecc71;
}

.badge-complete .dot {
  background: #2ecc71;
}

.inquiry-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: white;
}

.inquiry-status.대기중 {
  background-color: #e74c3c;
}

.inquiry-status.답변완료 {
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

.inquiry-message,
.inquiry-reply {
  margin-bottom: 1rem;
}

.inquiry-message h4,
.inquiry-reply h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.inquiry-message p,
.inquiry-reply p {
  margin: 0 0 1rem;
  color: #666;
}

.inquiry-attachments {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.inquiry-attachments h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.inquiry-attachments ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.inquiry-attachments li {
  margin-bottom: 0.25rem;
}

.inquiry-attachments a {
  color: #3498db;
  text-decoration: none;
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
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
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
</style> 