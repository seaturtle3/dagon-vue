<template>
  <div class="dropdown notification-dropdown">
    <button class="btn btn-link text-danger fs-4 p-0 position-relative"
            @click="toggleNotificationDropdown"
            style="width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border: none; background: none; overflow: visible; border-radius: 50%;">
      <SirenIcon style="font-size: 1.5rem;"/>
      <span v-if="unreadCount > 0" class="badge bg-danger position-absolute notification-dot" 
            style="top: 10px; right: 10px; width: 6px; height: 6px; min-width: 0; padding: 0; border-radius: 50%; z-index: 2;">
      </span>
    </button>
    <div v-if="showNotificationDropdown" class="dropdown-menu notification-dropdown-menu show" @click.stop>
      <div class="dropdown-header d-flex justify-content-between align-items-center">
        <span>알림</span>
        <button v-if="unreadCount > 0" @click.stop="markAllAsRead" class="btn btn-sm btn-link p-0">
          전체 읽음
        </button>
      </div>
      <div class="notification-list">
        <div v-if="loading" class="text-center py-3">
          <small class="text-muted">불러오는 중...</small>
        </div>
        <div v-else-if="visibleNotifications.length === 0" class="text-center py-3">
          <small class="text-muted">알림이 없습니다</small>
        </div>
        <div v-else>
          <div v-for="notification in visibleNotifications.slice(0, 5)" :key="notification && notification.id"
               class="notification-item"
               :class="{ unread: notification && !notification.read }"
               @click.stop="openNotificationModal(notification)">
            <div class="notification-content" v-if="notification">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-time">{{ formatTime(notification.time) }}</div>
            </div>
            <button class="notification-close-btn" v-if="notification" @click.stop="hideNotification(notification.id)">×</button>
          </div>
          <div v-if="visibleNotifications.length > 5" class="text-center py-2">
            <router-link to="/mypage/notifications" class="btn btn-sm btn-link" @click.stop>
              더보기
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showNotificationModal" class="custom-modal-overlay" @click.self="closeNotificationModal">
      <div class="custom-modal-content modern-modal">
        <button class="custom-modal-close right-top" @click="closeNotificationModal" title="창 닫기">&times;</button>
        <div class="custom-modal-header notification-modal-header modern-modal-header">
          <span class="modern-modal-title">{{ selectedNotification?.title }}</span>
        </div>
        <div class="custom-modal-body modern-modal-body">
          <div class="modern-modal-content">{{ selectedNotification?.content }}</div>
          <div class="modern-modal-time">{{ formatTime(selectedNotification?.time) }}</div>
        </div>
        <button v-if="selectedNotification" class="notification-delete-btn modal-bottom modern-modal-delete" @click="deleteNotificationFromModal" title="알림 삭제">
          <i class="fa-solid fa-x"></i>
          <span class="delete-text">삭제</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import {ref, computed, nextTick, onMounted, onUnmounted} from 'vue'
import SirenIcon from '@/components/icons/SirenIcon.vue'
import {myPageAPI} from '@/api/mypage.js'
import {useRouter} from 'vue-router'

const props = defineProps({
  user: Object,
  token: String
})
const router = useRouter()
const notifications = ref([])
const loading = ref(false)
const showNotificationDropdown = ref(false)
const showNotificationModal = ref(false)
const selectedNotification = ref(null)
const hiddenNotifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const visibleNotifications = computed(() => notifications.value.filter(n => n && n.id && !hiddenNotifications.value.includes(n.id)))

// 자동 알림 업데이트를 위한 인터벌
let notificationInterval = null

const fetchNotifications = async () => {
  if (!props.user?.uno) return
  try {
    loading.value = true
    const response = await myPageAPI.getNotifications(props.user.uno)
    if (Array.isArray(response)) {
      notifications.value = (response || []).filter(n => n && n.id).map(notification => {
        const timeValue = notification.createdAt || notification.created_at || notification.time || notification.date
        return {
          id: notification.id,
          type: notification.type || 'default',
          title: notification.title,
          content: notification.content,
          time: timeValue,
          read: notification.read
        }
      })
    }
  } catch (error) {
    notifications.value = []
  } finally {
    loading.value = false
  }
}
const markAsRead = async (id) => {
  try {
    await myPageAPI.markNotificationAsRead(id)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) notification.read = true
  } catch {}
}
const markAllAsRead = async () => {
  try {
    const unreadNotifications = notifications.value.filter(n => !n.read)
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)))
  } catch {}
}
const toggleNotificationDropdown = async (event) => {
  event.stopPropagation()
  if (showNotificationDropdown.value) {
    showNotificationDropdown.value = false
  } else {
    showNotificationDropdown.value = true
    await nextTick()
    fetchNotifications()
  }
}
const formatTime = (timeString) => {
  if (!timeString) return '시간 없음'
  try {
    const date = new Date(timeString)
    if (isNaN(date.getTime())) return '시간 오류'
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  } catch { return '시간 오류' }
}
const openNotificationModal = (notification) => {
  selectedNotification.value = notification
  showNotificationModal.value = true
}
const closeNotificationModal = () => {
  showNotificationModal.value = false
  selectedNotification.value = null
}
const deleteNotificationFromModal = async () => {
  if (!selectedNotification.value) return
  if (!confirm('이 알림을 삭제하시겠습니까?')) return
  try {
    await myPageAPI.deleteNotification(selectedNotification.value.id)
    notifications.value = notifications.value.filter(n => n.id !== selectedNotification.value.id)
    closeNotificationModal()
  } catch {
    alert('알림 삭제에 실패했습니다.')
  }
}
const hideNotification = (id) => {
  if (!hiddenNotifications.value.includes(id)) {
    hiddenNotifications.value.push(id)
    localStorage.setItem('hiddenNotifications', JSON.stringify(hiddenNotifications.value))
  }
}
const handleClickOutside = (event) => {
  // 알림 버튼/팝업 내부 클릭이면 무시
  const dropdown = document.querySelector('.notification-dropdown-menu');
  const button = document.querySelector('.notification-dropdown button');
  if (
    (dropdown && dropdown.contains(event.target)) ||
    (button && button.contains(event.target))
  ) {
    return;
  }
  showNotificationDropdown.value = false;
};
onMounted(() => {
  const stored = localStorage.getItem('hiddenNotifications')
  if (stored) {
    try { hiddenNotifications.value = JSON.parse(stored) } catch { hiddenNotifications.value = [] }
  }
  document.addEventListener('click', handleClickOutside);
  
  // 컴포넌트 마운트 시 알림 가져오기
  if (props.user?.uno) {
    fetchNotifications()
  }
  
  // 30초마다 알림 자동 업데이트
  notificationInterval = setInterval(() => {
    if (props.user?.uno) {
      fetchNotifications()
    }
  }, 30000) // 30초
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  
  // 인터벌 정리
  if (notificationInterval) {
    clearInterval(notificationInterval)
    notificationInterval = null
  }
})
</script>
<style scoped>
.notification-dropdown button {
  border-radius: 50% !important;
  transition: background 0.2s;
}
.notification-dot {
  display: inline-block;
  background: #dc3545;
  border-radius: 50% !important;
  width: 9px;
  height: 9px;
  min-width: 0;
  padding: 0;
  z-index: 2;
}

/* 전체 읽음 버튼 스타일 */
.notification-dropdown .btn-link {
  border-radius: 0 !important;
  text-decoration: none;
  color: #6c757d;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border: none;
  background: none;
  transition: color 0.2s;
}

.notification-dropdown .btn-link:hover {
  background: none !important;
  color: #495057;
  text-decoration: none;
  font-size: 0.85rem !important;
  transform: none !important;
}

.notification-dropdown .btn-link:focus {
  box-shadow: none;
  background: none;
}
</style> 