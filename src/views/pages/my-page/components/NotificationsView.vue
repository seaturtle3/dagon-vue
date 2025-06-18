<template>
  <ModalDialog
    :show="showLoginModal"
    title="로그인 필요"
    message="알림 조회는 로그인 후 이용 가능합니다."
    confirmText="로그인 페이지로 이동"
    :onConfirm="goToLogin"
  />
  <ModalDialog
    :show="showErrorModal"
    title="오류"
    :message="errorMessage"
    :onConfirm="() => showErrorModal = false"
  />
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
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.content }}</div>
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
import { ref, computed, onMounted, watch } from 'vue';
import { myPageAPI } from '@/api/mypage.js';
import { useAuthStore } from '@/store/login/loginStore.js'; // 올바른 auth store import
import ModalDialog from '@/components/common/ModalDialog.vue';

const authStore = useAuthStore();
const selectedFilter = ref('all');
const notifications = ref([]);
const loading = ref(false);
const isInitialized = ref(false);
const showLoginModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');

// 사용자 정보 초기화 확인
const initializeUserInfo = async () => {
  try {
    // localStorage에서 사용자 정보 확인
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      authStore.setUser(parsedUser);
      console.log('localStorage에서 사용자 정보 복원:', parsedUser);
    } else {
      console.log('localStorage에 사용자 정보 없음');
    }
  } catch (error) {
    console.error('사용자 정보 초기화 중 오류:', error);
  } finally {
    isInitialized.value = true;
  }
};

// 알림 목록 조회
const fetchNotifications = async () => {
  try {
    loading.value = true;

    // 로그인 상태 확인
    if (!authStore.isAuthenticated) {
      console.warn('사용자가 로그인되어 있지 않습니다.');
      notifications.value = [];
      return;
    }

    const userUno = authStore.user?.uno;
    console.log('authStore 전체:', authStore);
    console.log('현재 사용자 정보:', authStore.user);
    console.log('현재 사용자 UNO:', userUno);

    if (!userUno) {
      console.warn('사용자 번호가 없습니다.');
      return;
    }

    const response = await myPageAPI.getNotifications(userUno);
    console.log('알림 API 응답:', response);

    if (Array.isArray(response)) {
      notifications.value = response.map(notification => ({
        id: notification.id,
        type: notification.type || 'default',
        message: `${notification.title} - ${notification.content}`,
        time: new Date(notification.createdAt).toLocaleString(),
        read: notification.read,
        title: notification.title,
        content: notification.content
      }));
    }
  } catch (error) {
    console.error('알림 조회 실패:', error);
    notifications.value = [];
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

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  console.log('NotificationsView 컴포넌트가 마운트되었습니다.');
  // 인증 상태 확인
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    fetchNotifications();
  } else {
    console.warn('사용자가 인증되지 않았습니다.');
    showLoginModal.value = true;
  }
});

// 사용자 정보 변경 감지
watch(() => authStore.user, (newUser) => {
  console.log('사용자 정보가 변경되었습니다:', newUser);
  if (newUser?.uno && authStore.isAuthenticated) {
    fetchNotifications();
  }
}, { immediate: true });
</script>

<style scoped>
.notifications-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #0d47a1;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 1rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  border: 2px solid #90caf9;
}

.notification-filters {
  width: 200px;
}

.form-select {
  padding: 0.75rem;
  border: 2px solid #90caf9;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  color: #1565c0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
  outline: none;
}

.btn-text {
  background: none;
  border: none;
  color: #1976d2;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.btn-text:hover {
  background: rgba(25, 118, 210, 0.1);
  transform: translateY(-2px);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #90caf9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.notification-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
}

.notification-item.unread {
  background: rgba(227, 242, 253, 0.9);
  border-color: #1976d2;
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #1976d2;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  border-radius: 50%;
  color: #1976d2;
  font-size: 1.2rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.notification-item:hover .notification-icon {
  transform: scale(1.1);
  background: #1976d2;
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0d47a1;
  margin-bottom: 0.5rem;
}

.notification-message {
  color: #546e7a;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.notification-time {
  color: #78909c;
  font-size: 0.85rem;
}

.notification-action {
  color: #90caf9;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.notification-item:hover .notification-action {
  color: #1976d2;
  transform: translateX(5px);
}

.loading-state, .no-notifications {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  color: #546e7a;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  border: 2px solid #90caf9;
}

@media (max-width: 768px) {
  .notifications-container {
    padding: 1rem;
  }

  .notifications-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .notification-filters {
    width: 100%;
  }

  .notification-item {
    padding: 1rem;
    gap: 1rem;
  }

  .notification-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}
</style> 