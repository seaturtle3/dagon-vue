<template>
  <div class="notifications">
    <h1>알림 관리</h1>
    
    <!-- 에러 메시지 표시 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div class="notification-actions">
      <button @click="showCreateModal = true" class="create-btn">새 알림 작성</button>
    </div>
    
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="알림 제목으로 검색">
      <select v-model="typeFilter">
        <option value="">전체 유형</option>
        <option :value="notificationTypes.NOTICE">공지사항</option>
        <option :value="notificationTypes.RESERVATION">예약</option>
        <option :value="notificationTypes.ANSWER">답변</option>
        <option :value="notificationTypes.SYSTEM">시스템</option>
      </select>
      <button @click="searchNotifications">검색</button>
    </div>
    
    <table class="notifications-table">
      <thead>
        <tr>
          <th>번호</th>
          <th>유형</th>
          <th>제목</th>
          <th>발신자</th>
          <th>수신자</th>
          <th>작성일</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="notification in notifications" :key="notification.id">
          <td>{{ notification.id }}</td>
          <td>{{ notification.type }}</td>
          <td>{{ notification.title }}</td>
          <td>{{ notification.senderName || '시스템' }}</td>
          <td>{{ notification.receiverUid }}</td>
          <td>{{ formatDate(notification.createdAt) }}</td>
          <td>
            <button @click="viewNotification(notification.id)">보기</button>
            <button @click="deleteNotification(notification.id)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination">
      <button :disabled="currentPage === 0" @click="changePage(currentPage - 1)">이전</button>
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages - 1" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 알림 작성/수정 모달 -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-content">
        <h2>알림 작성</h2>
        <form @submit.prevent="submitNotification">
          <div class="form-group">
            <label>유형</label>
            <select v-model="notificationForm.type" required>
              <option :value="notificationTypes.NOTICE">공지사항</option>
              <option :value="notificationTypes.RESERVATION">예약</option>
              <option :value="notificationTypes.ANSWER">답변</option>
              <option :value="notificationTypes.SYSTEM">시스템</option>
            </select>
          </div>
          <div class="form-group">
            <label>수신자</label>
            <input type="text" v-model="notificationForm.receiverUid" placeholder="전체 발송시 비워두세요">
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

    <!-- 알림 상세 보기 모달 -->
    <div v-if="showViewModal" class="modal">
      <div class="modal-content">
        <NotificationView 
          :notification="selectedNotification"
          @close="showViewModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { notificationApi, NOTIFICATION_TYPES } from '@/api/admin'
import NotificationView from './NotificationView.vue'

export default {
  name: 'Notifications',
  components: {
    NotificationView
  },
  data() {
    return {
      searchQuery: '',
      typeFilter: '',
      notifications: [],
      currentPage: 0,
      totalPages: 1,
      itemsPerPage: 10,
      showCreateModal: false,
      showViewModal: false,
      selectedNotification: null,
      notificationForm: {
        type: NOTIFICATION_TYPES.NOTICE,
        receiverUid: '',
        title: '',
        content: '',
        senderType: 'ADMIN'
      },
      error: null,
      notificationTypes: NOTIFICATION_TYPES
    }
  },
  methods: {
    async searchNotifications() {
      this.error = null
      try {
        const response = await notificationApi.getNotifications(
          this.currentPage,
          this.itemsPerPage,
          this.searchQuery,
          this.typeFilter
        )
        this.notifications = response.data.content
        this.totalPages = response.data.totalPages
      } catch (error) {
        console.error('알림 검색 실패:', error)
        this.error = '알림 목록을 불러오는데 실패했습니다.'
        if (error.response) {
          console.error('서버 응답:', error.response.data)
        }
      }
    },
    async viewNotification(id) {
      this.error = null
      try {
        const response = await notificationApi.getNotificationDetail(id)
        this.selectedNotification = response.data
        this.showViewModal = true
      } catch (error) {
        console.error('알림 조회 실패:', error)
        this.error = '알림 상세 정보를 불러오는데 실패했습니다.'
      }
    },
    async deleteNotification(id) {
      if (!confirm('정말 삭제하시겠습니까?')) return
      
      this.error = null
      try {
        await notificationApi.deleteNotification(id)
        await this.searchNotifications()
      } catch (error) {
        console.error('알림 삭제 실패:', error)
        this.error = '알림 삭제에 실패했습니다.'
      }
    },
    async submitNotification() {
      this.error = null
      try {
        if (this.notificationForm.receiverUid) {
          // 특정 사용자에게 발송
          await notificationApi.sendSimpleNotification(this.notificationForm)
        } else {
          // 전체 발송
          await notificationApi.sendBroadcastNotification(this.notificationForm)
        }
        this.showCreateModal = false
        await this.searchNotifications()
      } catch (error) {
        console.error('알림 등록 실패:', error)
        this.error = '알림 등록에 실패했습니다.'
        if (error.response) {
          console.error('서버 응답:', error.response.data)
        }
      }
    },
    changePage(page) {
      this.currentPage = page
      this.searchNotifications()
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #ef9a9a;
}
</style> 