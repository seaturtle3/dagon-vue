<template>
  <nav class="navbar navbar-light bg-light fixed-top border-bottom px-3">
    <div class="container-fluid ps-0" style="max-width: 80%;">

      <!-- 로고 -->
      <router-link to="/" class="navbar-brand fs-3">DΛGON</router-link>

      <!-- 햄버거 버튼 (모바일/태블릿에서만 보임) -->
      <button class="navbar-toggler d-lg-none" type="button" @click="toggleMobileMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 메인 네비게이션 -->
      <ul class="navbar-nav d-flex flex-row gap-4 position-absolute start-50 translate-middle-x d-none d-lg-flex">
        <li v-for="item in menuItems" :key="item.label" class="nav-item position-relative"
            @mouseenter="item.open = true" @mouseleave="item.open = false">

          <!-- 상위 메뉴 -->
          <template v-if="item.children">
            <router-link class="nav-link" :to="item.link">{{ item.label }}</router-link>

            <ul v-if="item.open" class="dropdown-menu-custom">
              <li v-for="sub in item.children" :key="sub.label">
                <router-link class="dropdown-item" :to="sub.link">{{ sub.label }}</router-link>
              </li>
            </ul>
          </template>

          <!-- 단일 메뉴 -->
          <template v-else>
            <router-link class="nav-link" :to="item.link">{{ item.label }}</router-link>
          </template>
        </li>
      </ul>

      <!-- 우측 버튼 -->
      <div class="d-flex align-items-center gap-2">
        <router-link to="/multtae" class="btn btn-outline-primary btn-sm">🌊 물때·날씨</router-link>

        <template v-if="!authStore.isAuthenticated">
          <router-link to="/signup" class="btn btn-outline-secondary btn-sm">회원가입</router-link>
          <router-link to="/login" class="btn btn-outline-secondary btn-sm">로그인</router-link>
          <router-link to="/admin/login" class="btn btn-outline-primary btn-sm">관리자 로그인</router-link>
        </template>

        <template v-else-if="authStore.isAuthenticated">
          <div class="dropdown">
            <a class="dropdown-toggle d-flex align-items-center text-dark text-decoration-none"
               href="#" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <img :src="authStore.user?.profileImage || '/default.png'" width="32" />
              {{ authStore.user?.name || '사용자' }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/mypage">내 정보</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/mypage/reservations">예약조회</router-link>
              </li>
              <li>
                <hr class="dropdown-divider"/>
              </li>
              <li><a class="dropdown-item" href="#" @click="logout">로그아웃</a></li>
            </ul>
          </div>

          <!-- 알람 드롭다운 -->
          <div class="dropdown notification-dropdown">
            <button class="btn btn-link text-danger fs-4 p-0 position-relative"
                    @click="toggleNotificationDropdown"
                    style="width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border: none; background: none;">
              <SirenIcon style="font-size: 1.5rem;"/>
              <!-- 읽지 않은 알람 개수 표시 -->
              <span v-if="unreadCount > 0" class="badge bg-danger position-absolute top-0 start-100 translate-middle" 
                    style="font-size: 0.6rem; min-width: 16px; height: 16px;">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>
            
            <!-- 알람 드롭다운 메뉴 -->
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
                
                <div v-else-if="notifications.length === 0" class="text-center py-3">
                  <small class="text-muted">알림이 없습니다</small>
                </div>
                
                <div v-else>
                  <div v-for="notification in notifications.slice(0, 5)" :key="notification.id"
                       class="notification-item"
                       :class="{ unread: !notification.read }"
                       @click.stop="markAsRead(notification.id)">
                    <div class="notification-content">
                      <div class="notification-title">{{ notification.title }}</div>
                      <div class="notification-time">{{ formatTime(notification.time) }}</div>
                    </div>
                  </div>
                  
                  <div v-if="notifications.length > 5" class="text-center py-2">
                    <router-link to="/mypage/notifications" class="btn btn-sm btn-link" @click.stop>
                      더보기
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 모바일/태블릿 메뉴 (햄버거 클릭 시 드롭다운) -->
      <ul v-if="isMobileMenuOpen" class="mobile-menu d-lg-none">
        <li v-for="item in menuItems" :key="item.label" class="nav-item">
          <router-link class="nav-link" :to="item.link" @click="closeMobileMenu">{{ item.label }}</router-link>
          <ul v-if="item.children">
            <li v-for="sub in item.children" :key="sub.label">
              <router-link class="dropdown-item" :to="sub.link" @click="closeMobileMenu">{{ sub.label }}</router-link>
            </li>
          </ul>
        </li>
      </ul>

    </div>
  </nav>

</template>

<script setup>
import {ref, onMounted, computed, onUnmounted, nextTick} from 'vue'
import SirenIcon from '@/components/icons/SirenIcon.vue'
import {useAdminAuthStore} from "@/store/auth/auth.js";
import {myPageAPI} from '@/api/mypage.js'
import {useRouter} from 'vue-router'

const authStore = useAdminAuthStore()
const router = useRouter()

// 알람 관련 상태
const notifications = ref([])
const loading = ref(false)
const showNotificationDropdown = ref(false)
const clickOutsideListener = ref(null)

// 읽지 않은 알람 개수
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const logout = () => {
  authStore.clearToken()
  router.push('/login')
}

// 알람 목록 조회
const fetchNotifications = async () => {
  console.log('fetchNotifications 호출됨')
  console.log('인증 상태:', authStore.isAuthenticated)
  console.log('사용자 정보:', authStore.user)
  
  // localStorage 전체 확인
  console.log('localStorage 전체 키들:', Object.keys(localStorage))
  
  // 사용자 정보가 없으면 localStorage 에서 가져오기 시도
  let userInfo = authStore.user
  if (!userInfo) {
    try {
      // 여러 가능한 키에서 사용자 정보 찾기
      const possibleKeys = ['userInfo', 'user', 'userData', 'authUser', 'currentUser']
      for (const key of possibleKeys) {
        const storedData = localStorage.getItem(key)
        if (storedData) {
          console.log(`${key}에서 데이터 발견:`, storedData)
          try {
            const parsed = JSON.parse(storedData)
            if (parsed && (parsed.uno || parsed.id || parsed.userId)) {
              userInfo = parsed
              console.log(`${key}에서 사용자 정보 파싱 성공:`, userInfo)
              break
            }
          } catch (parseError) {
            console.log(`${key} 파싱 실패:`, parseError)
          }
        }
      }
      
      // 토큰에서 사용자 정보 추출 시도
      const token = localStorage.getItem('token')
      if (token && !userInfo) {
        console.log('토큰 발견:', token)
        try {
          // JWT 토큰 디코딩 (간단한 방법)
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('토큰 페이로드:', payload)
          if (payload.uno || payload.id || payload.userId) {
            userInfo = payload
            console.log('토큰에서 사용자 정보 추출:', userInfo)
          }
        } catch (tokenError) {
          console.log('토큰 디코딩 실패:', tokenError)
        }
      }
    } catch (error) {
      console.error('localStorage 사용자 정보 파싱 실패:', error)
    }
  }
  
  if (!authStore.isAuthenticated || !userInfo?.uno) {
    console.log('인증되지 않았거나 사용자 번호가 없음')
    console.log('userInfo:', userInfo)
    return
  }
  
  try {
    loading.value = true
    console.log('API 호출 시작 - 사용자 번호:', userInfo.uno)
    const response = await myPageAPI.getNotifications(userInfo.uno)
    console.log('API 응답:', response)
    
    if (Array.isArray(response)) {
      notifications.value = response.map(notification => {
        console.log('원본 알림 데이터:', notification)
        console.log('createdAt 필드:', notification.createdAt)
        console.log('createdAt 타입:', typeof notification.createdAt)
        
        const timeValue = notification.createdAt || notification.created_at || notification.time || notification.date
        console.log('사용할 시간 값:', timeValue)
        
        return {
          id: notification.id,
          type: notification.type || 'default',
          title: notification.title,
          content: notification.content,
          time: timeValue,
          read: notification.read
        }
      })
      console.log('알림 데이터 변환 완료:', notifications.value)
    } else {
      console.log('응답이 배열이 아님:', typeof response)
    }
  } catch (error) {
    console.error('알림 조회 실패:', error)
    console.error('에러 상세:', error.response?.data || error.message)
    notifications.value = []
  } finally {
    loading.value = false
  }
}

// 알람 읽음 처리
const markAsRead = async (id) => {
  try {
    await myPageAPI.markNotificationAsRead(id)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error)
  }
}

// 전체 읽음 처리
const markAllAsRead = async () => {
  try {
    const unreadNotifications = notifications.value.filter(n => !n.read)
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)))
  } catch (error) {
    console.error('전체 읽음 처리 실패:', error)
  }
}

// 클릭 외부 감지
const handleClickOutside = async (event) => {
  // console.log('클릭 이벤트 발생:', event.target)
  const dropdown = event.target.closest('.notification-dropdown')
  // console.log('드롭다운 요소:', dropdown)
  
  if (!dropdown) {
    // console.log('드롭다운 외부 클릭 - 닫기')
    showNotificationDropdown.value = false
    await nextTick()
    // console.log('드롭다운 상태 업데이트 완료:', showNotificationDropdown.value)
  }
}

// ESC 키로 드롭다운 닫기
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && showNotificationDropdown.value) {
    // console.log('ESC 키 - 드롭다운 닫기')
    showNotificationDropdown.value = false
  }
}

// 드롭다운 토글
const toggleNotificationDropdown = async (event) => {
  event.stopPropagation() // 이벤트 버블링 방지
  console.log('알람 버튼 클릭됨')
  
  if (showNotificationDropdown.value) {
    // 이미 열려있으면 닫기
    showNotificationDropdown.value = false
    console.log('드롭다운 닫기')
  } else {
    // 닫혀있으면 열기
    showNotificationDropdown.value = true
    console.log('드롭다운 열기')
    await nextTick()
    fetchNotifications()
  }
}

// 시간 포맷팅
const formatTime = (timeString) => {
  console.log('시간 포맷팅 입력:', timeString)
  
  if (!timeString) {
    console.log('시간 문자열이 없음')
    return '시간 없음'
  }
  
  try {
    const date = new Date(timeString)
    console.log('파싱된 날짜:', date)
    
    if (isNaN(date.getTime())) {
      console.log('유효하지 않은 날짜')
      return '시간 오류'
    }
    
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    let result
    if (minutes < 1) {
      result = '방금 전'
    } else if (minutes < 60) {
      result = `${minutes}분 전`
    } else if (hours < 24) {
      result = `${hours}시간 전`
    } else if (days < 7) {
      result = `${days}일 전`
    } else {
      result = date.toLocaleDateString('ko-KR')
    }
    
    console.log('포맷팅 결과:', result)
    return result
  } catch (error) {
    console.error('시간 포맷팅 오류:', error)
    return '시간 오류'
  }
}

onMounted(() => {
  authStore.loadTokenFromStorage()
  
  // 사용자 정보 초기화
  const initializeUserInfo = () => {
    try {
      const storedUser = localStorage.getItem('userInfo')
      if (storedUser && !authStore.user) {
        const userInfo = JSON.parse(storedUser)
        console.log('localStorage에서 사용자 정보 복원:', userInfo)
        // authStore에 사용자 정보 설정 (store에 setUser 메서드가 있다면)
        if (authStore.setUser) {
          authStore.setUser(userInfo)
        }
      }
    } catch (error) {
      console.error('사용자 정보 초기화 실패:', error)
    }
  }
  
  // 약간의 지연 후 사용자 정보 초기화 및 알람 로드
  setTimeout(() => {
    initializeUserInfo()
    
    // 클릭 외부 감지 리스너 추가
    clickOutsideListener.value = handleClickOutside
    document.addEventListener('click', clickOutsideListener.value, true)
    
    // 초기 알람 로드
    if (authStore.isAuthenticated) {
      fetchNotifications()
    }
  }, 100)
  
  // ESC 키 리스너 추가
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 리스너 제거
  if (clickOutsideListener.value) {
    document.removeEventListener('click', clickOutsideListener.value, true)
  }
  document.removeEventListener('keydown', handleKeyDown)
})

const menuItems = ref([
  {
    label: '조황센터',
    link: '/fishing-center',
    open: false,
    children: [
      {label: '조황정보', link: '/fishing-report'},
      {label: '조행기', link: '/fishing-diary'}
    ]
  },
  {label: '바다낚시', link: '/products/sea'},
  {label: '민물낚시', link: '/products/freshwater'},
  {
    label: '커뮤니티',
    link: '/event',
    open: false,
    children: [
      // {label: '자유게시판', link: 'free'},
      {label: '이벤트', link: '/event'},
      {label: '조황센터', link: '/fishing-center'}
    ]
  },
  {
    label: '고객센터',
    link: '/customer-service',
    open: false,
    children: [
      {label: '공지사항', link: '/notice'},
      {label: '자주묻는질문', link: '/faq'},
      {label: '1:1 문의', link: '/inquiry'},
      {label: '파트너 신청', link: '/partner/apply'}
    ]
  }
])

const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<style>
.nav-link:hover {
  font-weight: bold;
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 999;
  background: white;
  border: 1px solid #ccc;
  padding: 8px 0;
  margin: 0;
  list-style: none;
  min-width: 160px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.dropdown-menu-custom li {
  padding: 4px 20px;
}

.dropdown-menu-custom li:hover {
  background-color: #f1f1f1;
}

/* 알람 드롭다운 스타일 */
.notification-dropdown {
  position: relative;
}

.notification-dropdown button {
  transition: all 0.2s ease;
}

.notification-dropdown button:hover {
  transform: scale(1.1);
  background-color: rgba(220, 53, 69, 0.1) !important;
  border-radius: 50%;
}

.notification-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 9999;
  margin-top: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
}

.notification-dropdown-menu .dropdown-header {
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e3f2fd;
}

.notification-item.unread:hover {
  background-color: #bbdefb;
}

.notification-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #212529;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.notification-time {
  font-size: 0.8rem;
  color: #6c757d;
}

/* 슬라이드 트랜지션 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 햄버거 버튼 스타일 */
.navbar-toggler {
  border: none;
  background: transparent;
  font-size: 2rem;
  margin-left: 1rem;
}

/* 모바일 메뉴 스타일 */
.mobile-menu {
  position: absolute;
  top: 60px; /* 네비게이션 높이에 맞게 조정 */
  left: 0;
  width: 100vw;
  background: white;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 1rem 0;
  list-style: none;
}

@media (max-width: 1024px) {
  .navbar-nav.d-lg-flex {
    display: none !important;
  }
  .navbar-toggler {
    display: block !important;
  }
}
@media (min-width: 1025px) {
  .navbar-toggler {
    display: none !important;
  }
  .mobile-menu {
    display: none !important;
  }
}
</style>