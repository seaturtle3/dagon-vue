<template>
  <div class="notices">
    <h1>공지사항 관리</h1>
    <div class="notice-actions">
      <button @click="showCreateModal = true" class="create-btn">새 공지사항 작성</button>
    </div>
    
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="제목으로 검색">
      <select v-model="categoryFilter">
        <option value="">전체 카테고리</option>
        <option value="공지">공지</option>
        <option value="이벤트">이벤트</option>
        <option value="시스템">시스템</option>
      </select>
      <button @click="searchNotices">검색</button>
    </div>
    
    <div class="notices-list">
      <div v-for="notice in notices" :key="notice.id" class="notice-item">
        <div class="notice-header">
          <span class="notice-category">{{ notice.category }}</span>
          <h3>{{ notice.title }}</h3>
          <span class="notice-date">{{ notice.createdAt }}</span>
        </div>
        <div class="notice-content">
          <p>{{ notice.content }}</p>
          <div v-if="notice.attachments.length > 0" class="notice-attachments">
            <h4>첨부파일</h4>
            <ul>
              <li v-for="file in notice.attachments" :key="file.id">
                <a :href="file.url" target="_blank">{{ file.name }}</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="notice-actions">
          <button @click="viewNoticeDetails(notice.id)">상세</button>
          <button @click="editNotice(notice.id)">수정</button>
          <button @click="deleteNotice(notice.id)">삭제</button>
        </div>
      </div>
    </div>
    
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 공지사항 작성/수정 모달 -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h2>공지사항 작성</h2>
        <form @submit.prevent="submitNotice">
          <div class="form-group">
            <label>카테고리</label>
            <select v-model="noticeForm.category" required>
              <option value="공지">공지</option>
              <option value="이벤트">이벤트</option>
              <option value="시스템">시스템</option>
            </select>
          </div>
          <div class="form-group">
            <label>제목</label>
            <input type="text" v-model="noticeForm.title" required>
          </div>
          <div class="form-group">
            <label>내용</label>
            <textarea v-model="noticeForm.content" required></textarea>
          </div>
          <div class="form-group">
            <label>첨부파일</label>
            <input type="file" @change="handleFileUpload" multiple>
            <div v-if="noticeForm.attachments.length > 0" class="attachments-list">
              <div v-for="(file, index) in noticeForm.attachments" :key="index" class="attachment-item">
                <span>{{ file.name }}</span>
                <button type="button" @click="removeAttachment(index)">삭제</button>
              </div>
            </div>
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
  name: 'Notices',
  data() {
    return {
      searchQuery: '',
      categoryFilter: '',
      notices: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      showCreateModal: false,
      noticeForm: {
        category: '공지',
        title: '',
        content: '',
        attachments: []
      }
    }
  },
  methods: {
    async searchNotices() {
      // TODO: API 호출하여 공지사항 목록 검색
      this.notices = [
        {
          id: 1,
          category: '공지',
          title: '서비스 이용 안내',
          content: '서비스 이용과 관련된 안내사항입니다.',
          createdAt: '2024-03-15',
          attachments: [
            { id: 1, name: '이용약관.pdf', url: '/files/terms.pdf' }
          ]
        },
        // 더 많은 공지사항 데이터...
      ]
    },
    viewNoticeDetails(id) {
      // TODO: 공지사항 상세 보기
    },
    editNotice(id) {
      // TODO: 공지사항 수정
    },
    async deleteNotice(id) {
      // TODO: 공지사항 삭제 API 호출
    },
    handleFileUpload(event) {
      // TODO: 파일 업로드 처리
    },
    removeAttachment(index) {
      this.noticeForm.attachments.splice(index, 1)
    },
    async submitNotice() {
      // TODO: 공지사항 저장 API 호출
      this.showCreateModal = false
    },
    changePage(page) {
      this.currentPage = page
      this.searchNotices()
    }
  },
  created() {
    this.searchNotices()
  }
}
</script>

<style scoped>
.notices {
  padding: 1rem;
}

.notice-actions {
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

.notices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.notice-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.notice-category {
  padding: 0.25rem 0.5rem;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.notice-header h3 {
  margin: 0;
  flex: 1;
}

.notice-date {
  color: #666;
  font-size: 0.875rem;
}

.notice-content {
  margin-bottom: 1rem;
}

.notice-content p {
  margin: 0 0 1rem;
  color: #666;
}

.notice-attachments {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.notice-attachments h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.notice-attachments ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice-attachments li {
  margin-bottom: 0.25rem;
}

.notice-attachments a {
  color: #3498db;
  text-decoration: none;
}

.notice-actions {
  display: flex;
  gap: 0.5rem;
}

.notice-actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.notice-actions button:first-child {
  background-color: #3498db;
}

.notice-actions button:nth-child(2) {
  background-color: #f1c40f;
}

.notice-actions button:last-child {
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

.attachments-list {
  margin-top: 0.5rem;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.attachment-item button {
  padding: 0.25rem 0.5rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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