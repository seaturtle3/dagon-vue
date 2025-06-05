<template>
  <div class="notifications-container">
    <h2 class="page-title">내 알람</h2>
    
    <div class="notifications-header">
      <div class="notification-filters">
        <select v-model="selectedFilter" class="form-select">
          <option value="all">전체 알림</option>
          <option value="unread">읽지 않은 알림</option>
          <option value="read">읽은 알림</option>
        </select>
      </div>
      <button class="btn btn-text" @click="markAllAsRead" v-if="hasUnreadNotifications">
        전체 읽음 표시
      </button>
    </div>

    <div class="notifications-list">
      <div v-if="loading" class="loading-state">
        알림을 불러오는 중...
      </div>
      
      <div 
        v-else-if="filteredNotifications.length > 0"
        v-for="notification in filteredNotifications" 
        :key="notification.id" 
        class="notification-item"
        :class="{ unread: !notification.read }"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-icon">
          <i :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
        <div class="notification-action">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>

      <div v-else class="no-notifications">
        알림이 없습니다.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { myPageAPI } from '@/api/mypage';
import { useAuthStore } from '@/stores/auth'; // Pinia auth store를 사용합니다

const authStore = useAuthStore();
const selectedFilter = ref('all');
const notifications = ref([]);
const loading = ref(false);

// 알림 목록 조회
const fetchNotifications = async () => {
  try {
    loading.value = true;
    const userUid = authStore.user?.uid; // Pinia store에서 사용자 정보를 가져옵니다
    if (!userUid) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }
    const response = await myPageAPI.getNotifications(userUid);
    notifications.value = response.map(notification => ({
      id: notification.id,
      type: notification.type || 'default',
      message: notification.message,
      time: new Date(notification.createdAt).toLocaleString(),
      read: notification.read
    }));
  } catch (error) {
    console.error('알림 조회 실패:', error);
  } finally {
    loading.value = false;
  }
};

const filteredNotifications = computed(() => {
  if (selectedFilter.value === 'unread') {
    return notifications.value.filter(n => !n.read);
  }
  if (selectedFilter.value === 'read') {
    return notifications.value.filter(n => n.read);
  }
  return notifications.value;
});

const hasUnreadNotifications = computed(() => {
  return notifications.value.some(n => !n.read);
});

const getNotificationIcon = (type) => {
  const iconMap = {
    reservation: 'fas fa-calendar-check',
    point: 'fas fa-coins',
    promotion: 'fas fa-gift',
    default: 'fas fa-bell'
  };
  return iconMap[type] || iconMap.default;
};

const markAsRead = async (id) => {
  try {
    await myPageAPI.markNotificationAsRead(id);
    const notification = notifications.value.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
  }
};

const markAllAsRead = async () => {
  try {
    const unreadNotifications = notifications.value.filter(n => !n.read);
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
  } catch (error) {
    console.error('전체 읽음 처리 실패:', error);
  }
};

// 컴포넌트 마운트 시 알림 목록 조회
onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notifications-container {
  max-width: 800px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.notification-filters {
  width: 200px;
}

.form-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

.btn-text {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 0.875rem;
  cursor: pointer;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f8f9fa;
  border-left: 4px solid #1a73e8;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f0fe;
  border-radius: 50%;
  color: #1a73e8;
}

.notification-content {
  flex: 1;
}

.notification-message {
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.875rem;
  color: #6c757d;
}

.notification-action {
  color: #adb5bd;
}

.no-notifications {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 4px;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}
</style> 