<template>
  <div class="inquiries">
    <h1>1:1 문의 관리</h1>

    <div class="expand-controls">
      <button @click="expandAllCategories" title="전체 펼치기"><span class="expand-icon">▼</span></button>
      <button @click="collapseAllCategories" title="전체 접기"><span class="expand-icon">▲</span></button>
    </div>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="제목 또는 작성자로 검색">
      <select v-model="statusFilter">
        <option value="">전체 상태</option>
        <option value="대기중">대기중</option>
        <option value="답변완료">답변완료</option>
      </select>
      <button @click="searchInquiries">검색</button>
    </div>

    <div class="inquiries-list">
      <div v-for="(inquiries, category) in groupedInquiries" :key="category" class="category-group">
        <div class="category-header" @click="toggleCategory(category)">
          <span class="category-toggle">{{ expandedCategories.includes(category) ? '▼' : '▶' }}</span>
          <span class="category-title">{{ category }}</span>
          <span class="category-count">({{ inquiries.length }})</span>
        </div>
        <div v-if="expandedCategories.includes(category)" class="category-inquiries">
          <div v-for="inquiry in inquiries" :key="inquiry.id" class="inquiry-item">
            <div class="inquiry-header" @click="toggleInquiry(inquiry.id)">
              <span class="inquiry-status" :class="inquiry.status">{{ inquiry.status }}</span>
              <h3>{{ inquiry.title }}</h3>
              <span class="inquiry-author">{{ inquiry.author }}</span>
              <span class="inquiry-date">{{ formatDate(inquiry.createdAt) }}</span>
              <span class="inquiry-toggle">{{ expandedInquiries.includes(inquiry.id) ? '▼' : '▶' }}</span>
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
      </div>
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
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
            <button type="button" @click="showReplyModal = false">취소</button>
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
      expandedCategories: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      showReplyModal: false,
      editingReply: false,
      isAnswered: false,
      answerContent: '',
      answeredAt: '',
      replyForm: {
        inquiryId: null,
        content: ''
      }
    }
  },
  computed: {
    groupedInquiries() {
      // category 필드가 없으면 제목의 앞글자(혹은 앞 단어)로 분류
      const groups = {};
      for (const inquiry of this.inquiries) {
        let category = inquiry.category;
        if (!category) {
          const title = inquiry.title ? inquiry.title.trim() : '';
          if (title.startsWith('파트너')) category = '파트너 문의';
          else if (title.startsWith('예약')) category = '예약 문의';
          else if (title.startsWith('결제')) category = '결제 문의';
          else if (title.startsWith('포인트')) category = '포인트 문의';
          else category = '기타';
        }
        if (!groups[category]) groups[category] = [];
        groups[category].push(inquiry);
      }
      return groups;
    }
  },
  methods: {
    async searchInquiries() {
      try {
        const params = {
          keyword: this.searchQuery || '',
          status: this.statusFilter || '',
          page: this.currentPage - 1,
          size: this.itemsPerPage
        };
        const response = await inquiryApi.getInquiryList(params);
        this.inquiries = response.data.content;
        this.totalPages = response.data.totalPages;
        // 카테고리 펼침 상태 초기화 (처음엔 모두 닫힘)
        this.expandedCategories = [];
      } catch (error) {
        console.error('문의 목록 조회 실패:', error);
        alert('문의 목록 조회 중 오류가 발생했습니다.');
      }
    },
    toggleCategory(category) {
      const idx = this.expandedCategories.indexOf(category);
      if (idx === -1) {
        this.expandedCategories.push(category);
      } else {
        this.expandedCategories.splice(idx, 1);
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
        await this.searchInquiries();
      } catch (error) {
        console.error('답변 저장 실패:', error);
        alert('답변 저장 중 오류가 발생했습니다.');
      }
    },
    changePage(page) {
      this.currentPage = page
      this.searchInquiries()
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
    expandAllCategories() {
      this.expandedCategories = Object.keys(this.groupedInquiries);
    },
    collapseAllCategories() {
      this.expandedCategories = [];
    }
  },
  created() {
    this.searchInquiries()
  }
}
</script>

<style scoped>
.inquiries {
  padding: 1rem;
}

.expand-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.expand-controls button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.expand-controls button:hover {
  background-color: #0056b3;
}

.expand-icon {
  font-size: 1.5rem;
  line-height: 1;
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

.inquiries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-group {
  margin-bottom: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}
.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  background: #e3eafc;
  font-weight: bold;
  font-size: 1.1rem;
  border-radius: 8px 8px 0 0;
}
.category-toggle {
  font-size: 1.3rem;
  color: #007bff;
}
.category-title {
  flex: 1;
}
.category-count {
  color: #007bff;
  font-weight: 600;
}
.category-inquiries {
  padding: 0.5rem 1rem 1rem 1rem;
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

.inquiry-toggle {
  font-size: 1.25rem;
  color: #666;
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
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
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