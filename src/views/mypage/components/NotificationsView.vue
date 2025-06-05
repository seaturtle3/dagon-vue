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
      <div 
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

      <div v-if="filteredNotifications.length === 0" class="no-notifications">
        알림이 없습니다.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const selectedFilter = ref('all');

const notifications = ref([
  {
    id: 1,
    type: 'reservation',
    message: '예약하신 숙소의 체크인이 내일입니다.',
    time: '10분 전',
    read: false
  },
  {
    id: 2,
    type: 'point',
    message: '포인트 1,000P가 적립되었습니다.',
    time: '1시간 전',
    read: false
  },
  {
    id: 3,
    type: 'promotion',
    message: '봄맞이 특별 할인 이벤트가 시작되었습니다.',
    time: '어제',
    read: true
  }
]);

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
    promotion: 'fas fa-gift'
  };
  return iconMap[type] || 'fas fa-bell';
};

const markAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
};

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
};
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
</style> 