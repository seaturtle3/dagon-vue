<template>
  <div class="notifications">
    <h1>알림 관리</h1>
    <div class="notification-actions">
      <button @click="showCreateModal = true" class="create-btn">새 알림 작성</button>
    </div>
    
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="알림 제목으로 검색">
      <select v-model="typeFilter">
        <option value="">전체 유형</option>
        <option value="공지">공지</option>
        <option value="이벤트">이벤트</option>
        <option value="시스템">시스템</option>
      </select>
      <button @click="searchNotifications">검색</button>
    </div>
    
    <table class="notifications-table">
      <thead>
        <tr>
          <th>번호</th>
          <th>유형</th>
          <th>제목</th>
          <th>작성일</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="notification in notifications" :key="notification.id">
          <td>{{ notification.id }}</td>
          <td>{{ notification.type }}</td>
          <td>{{ notification.title }}</td>
          <td>{{ notification.createdAt }}</td>
          <td>{{ notification.status }}</td>
          <td>
            <button @click="viewNotification(notification.id)">보기</button>
            <button @click="editNotification(notification.id)">수정</button>
            <button @click="deleteNotification(notification.id)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 알림 작성/수정 모달 -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h2>알림 작성</h2>
        <form @submit.prevent="submitNotification">
          <div class="form-group">
            <label>유형</label>
            <select v-model="notificationForm.type" required>
              <option value="공지">공지</option>
              <option value="이벤트">이벤트</option>
              <option value="시스템">시스템</option>
            </select>
          </div>
          <div class="form-group">
            <label>제목</label>
            <input type="text" v-model="notificationForm.title" required>
          </div>
          <div class="form-group">
            <label>내용</label>
            <textarea v-model="notificationForm.content" required></textarea>
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
  name: 'Notifications',
  data() {
    return {
      searchQuery: '',
      typeFilter: '',
      notifications: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      showCreateModal: false,
      notificationForm: {
        type: '',
        title: '',
        content: ''
      }
    }
  },
  methods: {
    async searchNotifications() {
      // TODO: API 호출하여 알림 목록 검색
      this.notifications = [
        {
          id: 1,
          type: '공지',
          title: '시스템 점검 안내',
          createdAt: '2024-03-20',
          status: '활성'
        },
        // 더 많은 알림 데이터...
      ]
    },
    viewNotification(id) {
      // TODO: 알림 상세 보기
    },
    editNotification(id) {
      // TODO: 알림 수정
    },
    async deleteNotification(id) {
      // TODO: 알림 삭제 API 호출
    },
    async submitNotification() {
      // TODO: 알림 저장 API 호출
      this.showCreateModal = false
    },
    changePage(page) {
      this.currentPage = page
      this.searchNotifications()
    }
  },
  created() {
    this.searchNotifications()
  }
}
</script>

<style scoped>
.notifications {
  padding: 1rem;
}

.notification-actions {
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

.notifications-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.notifications-table th,
.notifications-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.notifications-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.notifications-table button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.notifications-table button:first-child {
  background-color: #3498db;
  color: white;
}

.notifications-table button:nth-child(2) {
  background-color: #f1c40f;
  color: white;
}

.notifications-table button:last-child {
  background-color: #e74c3c;
  color: white;
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