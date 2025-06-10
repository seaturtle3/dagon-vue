<template>
  <div class="events">
    <h1>이벤트 관리</h1>
    <div class="event-actions">
      <button @click="showCreateModal = true" class="create-btn">새 이벤트 작성</button>
    </div>
    
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="이벤트 제목으로 검색">
      <select v-model="statusFilter">
        <option value="">전체 상태</option>
        <option value="진행중">진행중</option>
        <option value="종료">종료</option>
        <option value="예정">예정</option>
      </select>
      <button @click="searchEvents">검색</button>
    </div>
    
    <div class="events-grid">
      <div v-for="event in events" :key="event.id" class="event-card">
        <div class="event-image">
          <img :src="event.image" :alt="event.title">
          <span class="event-status" :class="event.status">{{ event.status }}</span>
        </div>
        <div class="event-content">
          <h3>{{ event.title }}</h3>
          <p class="event-period">{{ event.startDate }} ~ {{ event.endDate }}</p>
          <p class="event-description">{{ event.description }}</p>
          <div class="event-actions">
            <button @click="viewEventDetails(event.id)">상세</button>
            <button @click="editEvent(event.id)">수정</button>
            <button @click="deleteEvent(event.id)">삭제</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 이벤트 작성/수정 모달 -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h2>이벤트 작성</h2>
        <form @submit.prevent="submitEvent">
          <div class="form-group">
            <label>제목</label>
            <input type="text" v-model="eventForm.title" required>
          </div>
          <div class="form-group">
            <label>이벤트 기간</label>
            <div class="date-range">
              <input type="date" v-model="eventForm.startDate" required>
              <span>~</span>
              <input type="date" v-model="eventForm.endDate" required>
            </div>
          </div>
          <div class="form-group">
            <label>이미지</label>
            <input type="file" @change="handleImageUpload" accept="image/*">
          </div>
          <div class="form-group">
            <label>내용</label>
            <textarea v-model="eventForm.description" required></textarea>
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
  name: 'Events',
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      events: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      showCreateModal: false,
      eventForm: {
        title: '',
        startDate: '',
        endDate: '',
        description: '',
        image: null
      }
    }
  },
  methods: {
    async searchEvents() {
      // TODO: API 호출하여 이벤트 목록 검색
      this.events = [
        {
          id: 1,
          title: '봄맞이 할인 이벤트',
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          description: '봄 시즌을 맞이하여 진행되는 특별 할인 이벤트입니다.',
          image: '/images/event1.jpg',
          status: '진행중'
        },
        // 더 많은 이벤트 데이터...
      ]
    },
    viewEventDetails(id) {
      // TODO: 이벤트 상세 보기
    },
    editEvent(id) {
      // TODO: 이벤트 수정
    },
    async deleteEvent(id) {
      // TODO: 이벤트 삭제 API 호출
    },
    handleImageUpload(event) {
      // TODO: 이미지 업로드 처리
    },
    async submitEvent() {
      // TODO: 이벤트 저장 API 호출
      this.showCreateModal = false
    },
    changePage(page) {
      this.currentPage = page
      this.searchEvents()
    }
  },
  created() {
    this.searchEvents()
  }
}
</script>

<style scoped>
.events {
  padding: 1rem;
}

.event-actions {
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

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.event-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.event-image {
  position: relative;
  height: 200px;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: white;
  font-size: 0.875rem;
}

.event-status.진행중 {
  background-color: #2ecc71;
}

.event-status.종료 {
  background-color: #e74c3c;
}

.event-status.예정 {
  background-color: #f1c40f;
}

.event-content {
  padding: 1rem;
}

.event-content h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.event-period {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.event-description {
  color: #666;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.event-actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.event-actions button:first-child {
  background-color: #3498db;
}

.event-actions button:nth-child(2) {
  background-color: #f1c40f;
}

.event-actions button:last-child {
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
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-range input {
  flex: 1;
}

.form-group textarea {
  height: 150px;
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