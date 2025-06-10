<template>
  <div class="faq">
    <h1>FAQ 관리</h1>
    <div class="faq-actions">
      <button @click="showCreateModal = true" class="create-btn">새 FAQ 작성</button>
    </div>
    
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="제목으로 검색">
      <select v-model="categoryFilter">
        <option value="">전체 카테고리</option>
        <option value="이용방법">이용방법</option>
        <option value="예약">예약</option>
        <option value="결제">결제</option>
        <option value="기타">기타</option>
      </select>
      <button @click="searchFAQs">검색</button>
    </div>
    
    <div class="faq-list">
      <div v-for="faq in faqs" :key="faq.id" class="faq-item">
        <div class="faq-header" @click="toggleFAQ(faq.id)">
          <span class="faq-category">{{ faq.category }}</span>
          <h3>{{ faq.question }}</h3>
          <span class="faq-toggle">{{ expandedFAQs.includes(faq.id) ? '▼' : '▶' }}</span>
        </div>
        <div v-if="expandedFAQs.includes(faq.id)" class="faq-content">
          <p>{{ faq.answer }}</p>
          <div class="faq-actions">
            <button @click="editFAQ(faq.id)">수정</button>
            <button @click="deleteFAQ(faq.id)">삭제</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- FAQ 작성/수정 모달 -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h2>FAQ 작성</h2>
        <form @submit.prevent="submitFAQ">
          <div class="form-group">
            <label>카테고리</label>
            <select v-model="faqForm.category" required>
              <option value="이용방법">이용방법</option>
              <option value="예약">예약</option>
              <option value="결제">결제</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div class="form-group">
            <label>질문</label>
            <input type="text" v-model="faqForm.question" required>
          </div>
          <div class="form-group">
            <label>답변</label>
            <textarea v-model="faqForm.answer" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit">저장</button>
            <button type="button" @click="showCreateModal = false">취소</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FAQ',
  data() {
    return {
      searchQuery: '',
      categoryFilter: '',
      faqs: [],
      expandedFAQs: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      showCreateModal: false,
      faqForm: {
        category: '이용방법',
        question: '',
        answer: ''
      }
    }
  },
  methods: {
    async searchFAQs() {
      // TODO: API 호출하여 FAQ 목록 검색
      this.faqs = [
        {
          id: 1,
          category: '이용방법',
          question: '어떻게 예약하나요?',
          answer: '홈페이지에서 원하는 날짜와 시간을 선택하여 예약할 수 있습니다.'
        },
        // 더 많은 FAQ 데이터...
      ]
    },
    toggleFAQ(id) {
      const index = this.expandedFAQs.indexOf(id)
      if (index === -1) {
        this.expandedFAQs.push(id)
      } else {
        this.expandedFAQs.splice(index, 1)
      }
    },
    editFAQ(id) {
      // TODO: FAQ 수정
    },
    async deleteFAQ(id) {
      // TODO: FAQ 삭제 API 호출
    },
    async submitFAQ() {
      // TODO: FAQ 저장 API 호출
      this.showCreateModal = false
    },
    changePage(page) {
      this.currentPage = page
      this.searchFAQs()
    }
  },
  created() {
    this.searchFAQs()
  }
}
</script>

<style scoped>
.faq {
  padding: 1rem;
}

.faq-actions {
  margin-bottom: 1rem;
}

.create-btn {
  padding: 0.5rem 1rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.faq-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.faq-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  background-color: #f8f9fa;
}

.faq-category {
  padding: 0.25rem 0.5rem;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.faq-header h3 {
  margin: 0;
  flex: 1;
}

.faq-toggle {
  font-size: 1.25rem;
  color: #666;
}

.faq-content {
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.faq-content p {
  margin: 0 0 1rem;
  color: #666;
}

.faq-actions {
  display: flex;
  gap: 0.5rem;
}

.faq-actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.faq-actions button:first-child {
  background-color: #f1c40f;
}

.faq-actions button:last-child {
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

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
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