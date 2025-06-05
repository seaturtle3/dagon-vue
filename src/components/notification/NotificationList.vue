<template>
  <div class="notification-container">
    <div class="notification-header">
      <h2>알림</h2>
      <button v-if="hasUnreadNotifications" @click="handleMarkAllAsRead" class="read-all-btn">
        모두 읽음 처리
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="notifications.length === 0" class="no-notifications">
      알림이 없습니다.
    </div>

    <div v-else class="notification-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-item', { 'unread': !notification.isRead }]"
        @click="handleNotificationClick(notification)"
      >
        <!-- 발신자 타입에 따른 아이콘 -->
        <div class="notification-icon">
          <i v-if="notification.senderType === 'ADMIN'" class="fas fa-user-shield"></i>
          <i v-else-if="notification.senderType === 'PARTNER'" class="fas fa-store"></i>
          <i v-else class="fas fa-bell"></i>
        </div>

        <div class="notification-content">
          <div class="notification-header">
            <h3 class="notification-title">{{ notification.title }}</h3>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <p class="notification-message">{{ notification.content }}</p>
          
          <!-- 알림 타입에 따른 추가 정보 -->
          <div v-if="notification.type === 'RESERVATION'" class="notification-details">
            <span class="reservation-info">
              예약 번호: {{ notification.reservation?.id }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { notificationAPI } from '@/api/notification';
import { useRouter } from 'vue-router';

const router = useRouter();
const notifications = ref([]);
const loading = ref(true);

const hasUnreadNotifications = computed(() => {
  return notifications.value.some(notification => !notification.isRead);
});

// 알림 목록 조회
const fetchNotifications = async () => {
  try {
    loading.value = true;
    const response = await notificationAPI.getUserNotifications();
    notifications.value = response.data;
  } catch (error) {
    console.error('알림 조회 실패:', error);
  } finally {
    loading.value = false;
  }
};

// 알림 클릭 처리
const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    try {
      await notificationAPI.markAsRead(notification.id);
      notification.isRead = true;
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  }

  // 알림 타입에 따른 페이지 이동
  if (notification.type === 'RESERVATION') {
    router.push(`/reservations/${notification.reservation.id}`);
  }
};

// 모든 알림 읽음 처리
const handleMarkAllAsRead = async () => {
  try {
    await notificationAPI.markAllAsRead();
    notifications.value = notifications.value.map(notification => ({
      ...notification,
      isRead: true
    }));
  } catch (error) {
    console.error('전체 읽음 처리 실패:', error);
  }
};

// 시간 포맷팅
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // 24시간 이내
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}분 전`;
    }
    return `${hours}시간 전`;
  }
  
  // 7일 이내
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}일 전`;
  }
  
  // 그 이상
  return date.toLocaleDateString();
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notification-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.read-all-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.read-all-btn:hover {
  background-color: #e0e0e0;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.notification-item:hover {
  transform: translateY(-2px);
}

.notification-item.unread {
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
}

.notification-icon {
  margin-right: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 50%;
}

.notification-icon i {
  font-size: 20px;
  color: #666;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.notification-time {
  font-size: 12px;
  color: #666;
}

.notification-message {
  font-size: 14px;
  color: #444;
  margin: 0;
  margin-bottom: 8px;
}

.notification-details {
  font-size: 12px;
  color: #666;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-notifications {
  text-align: center;
  padding: 40px;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 