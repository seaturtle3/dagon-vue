<template>
  <nav class="navbar navbar-light bg-light fixed-top border-bottom px-3">
    <div class="container-fluid ps-0">

      <!-- 로고 -->
      <router-link to="/" class="navbar-brand fs-3">DΛGON</router-link>

      <!-- 카테고리 메뉴: 데스크탑에서만 보이게 -->
      <ul class="navbar-nav d-flex flex-row gap-4 position-absolute start-50 translate-middle-x d-none d-xl-flex">
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

      <!-- 우측 버튼: 데스크탑 -->
      <div class="d-flex align-items-center gap-2 d-none d-xl-flex">
        <router-link to="/multtae" class="btn btn-outline-primary btn-sm">🌊 물때·날씨</router-link>

        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="btn btn-outline-secondary btn-sm">로그인</router-link>
          <router-link to="/admin/login" class="btn btn-outline-primary btn-sm">관리자 로그인</router-link>
        </template>

        <template v-else-if="authStore.isAuthenticated">
          <div class="dropdown">
            <a class="dropdown-toggle d-flex align-items-center text-dark text-decoration-none"
               href="#" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              {{ displayName }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <template v-if="isAdmin">
                <li>
                  <router-link class="dropdown-item" to="/admin/dashboard">관리자페이지</router-link>
                </li>
                <li>
                  <hr class="dropdown-divider"/>
                </li>
                <li><a class="dropdown-item" href="#" @click="logout">로그아웃</a></li>
              </template>
              <template v-else-if="isPartner">
                <li>
                  <router-link class="dropdown-item" to="/partner">파트너페이지</router-link>
                  <router-link class="dropdown-item" to="/mypage">마이페이지</router-link>
                </li>
                <li>
                  <hr class="dropdown-divider"/>
                </li>
                <li><a class="dropdown-item" href="#" @click="logout">로그아웃</a></li>
              </template>
              <template v-else>
                <li>
                  <router-link class="dropdown-item" to="/mypage">마이페이지</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/mypage/reservations">예약조회</router-link>
                </li>
                <li>
                  <hr class="dropdown-divider"/>
                </li>
                <li><a class="dropdown-item" href="#" @click="logout">로그아웃</a></li>
              </template>
            </ul>
          </div>
          <NotificationDropdown :user="authStore.user" :token="authStore.token"/>
        </template>
      </div>

      <!-- 햄버거 버튼: 1200px 미만에서만 보이게 (우측 버튼 div 바깥에 위치) -->
      <button class="navbar-toggler d-xl-none ms-auto" type="button" @click="toggleMobileMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 모바일/태블릿 메뉴 (햄버거 클릭 시 드롭다운): 1200px 미만에서만 보이게 -->
      <div class="mobile-menu-box" :class="{ show: isMobileMenuOpen }">
        <div class="mobile-menu-overlay">
          <div class="mobile-menu-header">
            <!-- 로고 -->
            <router-link to="/" class="navbar-brand fs-3">DΛGON</router-link>
            <!-- 닫기(X) 버튼 -->
            <button class="mobile-menu-close" @click="closeMobileMenu">&times;</button>

          </div>

          <!-- 로그인/관리자 로그인 버튼 (비로그인 시) -->
          <div v-if="!authStore.isAuthenticated" class="mobile-menu-login-btns">
            <router-link to="/login" class="btn mobile-btn" @click="closeMobileMenu">로그인</router-link>
            <router-link to="/admin/login" class="btn mobile-btn" @click="closeMobileMenu">관리자 로그인</router-link>
          </div>
          <!-- 로그인 상태별 메뉴 -->
          <div v-else class="mobile-menu-login-btns mobile-menu-user-block">
            <div class="mobile-menu-user-info">
              <span class="user-name"><b>{{ displayName }}</b></span>
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
                      <button class="notification-close-btn" v-if="notification"
                              @click.stop="hideNotification(notification.id)">×
                      </button>
                    </div>

                    <div v-if="visibleNotifications.length > 5" class="text-center py-2">
                      <router-link to="/mypage/notifications" class="btn btn-sm btn-link" @click.stop>
                        더보기
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mobile-menu-user-actions">
              <router-link v-if="isAdmin" to="/admin/dashboard" class="btn mobile-btn mobile-btn-page"
                           @click="closeMobileMenu">관리자페이지
              </router-link>
              <template v-else-if="isPartner">
                <router-link to="/partner" class="btn mobile-btn mobile-btn-page"
                           @click="closeMobileMenu">파트너페이지
                </router-link>
                <router-link to="/mypage" class="btn mobile-btn mobile-btn-page"
                           @click="closeMobileMenu">마이페이지
                </router-link>
              </template>
              <router-link v-else to="/mypage" class="btn mobile-btn mobile-btn-page" @click="closeMobileMenu">마이페이지
              </router-link>
              <a href="#" class="btn mobile-btn mobile-btn-logout" @click.prevent="logout">로그아웃</a>
            </div>
            <router-link v-if="!isAdmin && !isPartner" to="/mypage/reservations"
                         class="btn mobile-btn mobile-btn-reservation" @click="closeMobileMenu">예약조회
            </router-link>
          </div>
          <!-- 물때·날씨 버튼 -->
          <div class="mobile-menu-tide">
            <router-link to="/multtae" class="btn mobile-btn" @click="closeMobileMenu">🌊 물때·날씨</router-link>
          </div>

          <!-- 카테고리 -->
          <div class="mobile-menu-category">
            <div class="category-title">CATEGORY</div>
            <div class="category-table">
              <div v-for="row in flatMenuRows" :key="row.key" class="category-row">
                <div class="category-main">
                  <template v-if="row.showMain">
                    <router-link :to="row.main.link" @click="closeMobileMenu">{{ row.main.label }}</router-link>
                  </template>
                </div>
                <div class="category-sub">
                  <template v-if="row.sub">
                    <router-link :to="row.sub.link" @click="closeMobileMenu">{{ row.sub.label }}</router-link>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </nav>

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
      <button v-if="selectedNotification" class="notification-delete-btn modal-bottom modern-modal-delete"
              @click="deleteNotificationFromModal" title="알림 삭제">
        <i class="fa-solid fa-x"></i>
        <span class="delete-text">삭제</span>
      </button>
    </div>
  </div>

</template>

<script setup>
import {ref, onMounted, computed, onUnmounted, nextTick, watch} from 'vue'
import SirenIcon from '@/components/icons/SirenIcon.vue'
import {useAdminAuthStore} from "@/store/auth/auth.js";
import {myPageAPI} from '@/api/mypage.js'
import {useRouter} from 'vue-router'
import NotificationDropdown from '@/components/common/NotificationDropdown.vue'

const authStore = useAdminAuthStore()
const router = useRouter()

// 알람 관련 상태
const notifications = ref([])
const loading = ref(false)
const showNotificationDropdown = ref(false)
const clickOutsideListener = ref(null)
const showNotificationModal = ref(false)
const selectedNotification = ref(null)
const hiddenNotifications = ref([]);

// 읽지 않은 알람 개수
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// 사용자 타입 판별
const isAdmin = computed(() => {
  if (!authStore.user || !authStore.user.role) return false;
  const role = String(authStore.user.role).toUpperCase();
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
})

const isPartner = computed(() => {
  if (!authStore.user || !authStore.user.role) return false;
  const role = String(authStore.user.role).toUpperCase();
  return role === 'PARTNER';
})

const visibleNotifications = computed(() =>
    notifications.value.filter(n => n && n.id && !hiddenNotifications.value.includes(n.id))
);

// 화면 크기 감지
const windowWidth = ref(window.innerWidth)
const isLargeScreen = computed(() => windowWidth.value >= 1200)
const isMediumScreen = computed(() => windowWidth.value >= 768 && windowWidth.value < 1200)

// 화면 크기 변경 감지
const handleResize = () => {
  windowWidth.value = window.innerWidth

  // 1200px 이상으로 화면이 커지면 모바일 메뉴 닫기
  if (isLargeScreen.value && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// 화면 크기 변경 감지
watch(windowWidth, (newWidth) => {
  if (newWidth >= 1200 && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
})

// localStorage의 userInfo 변경 감지
watch(() => localStorage.getItem('userInfo'), (newUserInfo) => {
  if (newUserInfo) {
    try {
      const userInfo = JSON.parse(newUserInfo);
      if (userInfo && authStore.setUser) {
        authStore.setUser(userInfo);
      }
    } catch (error) {
      console.error('사용자 정보 파싱 실패:', error);
    }
  }
}, {immediate: true})

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

          // 한글 변환 없이 그대로 사용
          if (payload.uno || payload.id || payload.userId || payload.aid) {
            userInfo = {
              ...payload,
              name: payload.aname || payload.uname || payload.name
            }
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
    console.log('API 응답1:', response)

    if (Array.isArray(response)) {
      notifications.value = (response || []).filter(n => n && n.id).map(notification => {
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

const openNotificationModal = (notification) => {
  selectedNotification.value = notification
  showNotificationModal.value = true
}
const closeNotificationModal = () => {
  showNotificationModal.value = false
  selectedNotification.value = null
}

// 모달에서 알림 삭제
const deleteNotificationFromModal = async () => {
  if (!selectedNotification.value) return;
  if (!confirm('이 알림을 삭제하시겠습니까?')) return;
  try {
    await myPageAPI.deleteNotification(selectedNotification.value.id);
    notifications.value = notifications.value.filter(n => n.id !== selectedNotification.value.id);
    closeNotificationModal();
  } catch (error) {
    alert('알림 삭제에 실패했습니다.');
  }
};

onMounted(() => {
  // 1. 토큰/인증상태 복원
  authStore.loadTokenFromStorage();

  // 2. localStorage의 userInfo를 store에 동기화
  try {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const userInfo = JSON.parse(storedUser);
      if (authStore.setUser) {
        authStore.setUser(userInfo);
      }
    }
  } catch (error) {
    console.error('사용자 정보 초기화 실패:', error)
  }

  // ESC 키 리스너 추가
  document.addEventListener('keydown', handleKeyDown);

  // 화면 크기 변경 리스너 추가
  window.addEventListener('resize', handleResize);

  // 모바일 메뉴 외부 클릭 리스너 추가
  document.addEventListener('click', handleMobileMenuClickOutside);

  const stored = localStorage.getItem('hiddenNotifications');
  if (stored) {
    try {
      hiddenNotifications.value = JSON.parse(stored);
    } catch (e) {
      hiddenNotifications.value = [];
    }
  }
})

onUnmounted(() => {
  // 리스너 제거
  if (clickOutsideListener.value) {
    document.removeEventListener('click', clickOutsideListener.value, true)
  }
  document.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleMobileMenuClickOutside)
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
      {label: '관리자 1:1 문의', link: '/inquiry'},
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

const hideNotification = (id) => {
  if (!hiddenNotifications.value.includes(id)) {
    hiddenNotifications.value.push(id);
    localStorage.setItem('hiddenNotifications', JSON.stringify(hiddenNotifications.value));
  }
};

const displayName = computed(() => {
  // 1. authStore에서 먼저 확인
  if (authStore.user) {
    if (isAdmin.value) {
      return authStore.user?.name || authStore.user?.aname || '관리자';
    } else {
      return authStore.user?.nickname || authStore.user?.uname || authStore.user?.name || '사용자';
    }
  }

  // 2. localStorage에서 사용자 정보 확인
  try {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const userInfo = JSON.parse(storedUser);
      if (userInfo) {
        // 관리자인지 확인
        const isAdminUser = userInfo.role === 'ADMIN' || userInfo.role === 'SUPER_ADMIN';
        if (isAdminUser) {
          return userInfo.name || userInfo.aname || '관리자';
        } else {
          return userInfo.nickname || userInfo.uname || userInfo.name || '사용자';
        }
      }
    }
  } catch (error) {
    console.error('localStorage 사용자 정보 파싱 실패:', error);
  }

  // 3. 토큰에서 사용자 정보 추출 시도
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload) {
        const isAdminUser = payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN';
        if (isAdminUser) {
          return payload.aname || payload.name || '관리자';
        } else {
          return payload.uname || payload.name || '사용자';
        }
      }
    }
  } catch (error) {
    console.error('토큰에서 사용자 정보 추출 실패:', error);
  }

  return '사용자';
});

const flatMenuRows = computed(() => {
  const rows = []
  menuItems.value.forEach(main => {
    if (main.children && main.children.length > 0) {
      main.children.forEach((sub, idx) => {
        rows.push({
          key: main.label + '-' + (sub.label || idx),
          main,
          sub,
          showMain: idx === 0
        })
      })
    } else {
      rows.push({
        key: main.label,
        main,
        sub: null,
        showMain: true
      })
    }
  })
  return rows
})

const openNotificationDropdownFromMobile = () => {
  closeMobileMenu();
  showNotificationDropdown.value = true;
  fetchNotifications();
};

// 모바일 메뉴 외부 클릭 감지
const handleMobileMenuClickOutside = (event) => {
  if (isMobileMenuOpen.value) {
    const mobileMenuBox = event.target.closest('.mobile-menu-box')
    const mobileMenuOverlay = event.target.closest('.mobile-menu-overlay')
    const hamburgerButton = event.target.closest('.navbar-toggler')

    // mobile-menu-box를 클릭했지만 mobile-menu-overlay는 클릭하지 않았을 때 (즉, 회색 배경을 클릭했을 때)
    if (mobileMenuBox && !mobileMenuOverlay && !hamburgerButton) {
      closeMobileMenu()
    }
  }
}

watch(
    () => authStore.user,
    async (newUser) => {
      await nextTick();
      // 필요하다면 강제 리렌더 트리거 등 추가
      // console.log('user 변경됨:', newUser)
    },
    {deep: true}
)
</script>

<style>
.nav-link:hover {
  font-weight: bold;
}

.dropdown-menu-custom {
  background: #fff;
  color: #222 !important;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 0.5rem 0;
  min-width: 160px;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
}

.dropdown-menu-custom .dropdown-item {
  color: #222 !important;
  background: #fff !important;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.18s, color 0.18s;
}

.dropdown-menu-custom .dropdown-item:hover {
  background: #e3f2fd !important;
  color: #1976d2 !important;
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
  position: relative;
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

.notification-close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.1rem;
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  padding: 0;
  z-index: 2;
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
  z-index: 1051;
}

/* 모바일 메뉴 스타일 */

.mobile-menu-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 20000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  display: none; /* 기본적으로 숨김 */
}

/* 1200px 미만에서만 모바일 메뉴 표시 */
@media (max-width: 1199.98px) {
  .mobile-menu-box {
    display: block;
  }
}

.mobile-menu-box.show {
  opacity: 1;
  visibility: visible;
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #fff;
  overflow-y: auto;
  padding: 0;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
}

.mobile-menu-box.show .mobile-menu-overlay {
  transform: translateX(0);
}

/* 768px 이상 1200px 미만일 때 사이드바 스타일 */
@media (min-width: 768px) and (max-width: 1199.98px) {
  .mobile-menu-overlay {
    width: 768px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
}

/* 768px 미만일 때 전체 화면 스타일 */
@media (max-width: 767.98px) {
  .mobile-menu-overlay {
    width: 100%;
  }
}

.mobile-menu-close {
  position: absolute;
  top: 0;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 3rem; /* 더 크게 */
  font-weight: 100; /* 얇게 */
  line-height: 1;
  color: #222;
  cursor: pointer;
  z-index: 20100;
}

.mobile-menu-header {
  display: flex;
  padding: 0.5rem 1rem;
}

.mobile-menu-tide {
  display: flex;
  justify-content: center;
  margin-bottom: 1.2rem;
}

.mobile-menu-login-btns {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}

.mobile-menu-category {
  padding: 1.2rem 1.5rem;
}

.category-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}

.category-table {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.category-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1.5rem;
}

.category-main {
  min-width: 90px;
  font-weight: 600;
}

.category-sub {
  flex: 1;
  color: #1976ed;
  font-size: 1rem;
  word-break: keep-all;
}

.category-sub a {
  color: #1976ed;
  text-decoration: underline;
  margin-right: 0.5rem;
}

/* display 관련 미디어쿼리: d-xl-flex, d-xl-none만 사용 */
@media (min-width: 1200px) {
  .navbar-toggler,
  .mobile-menu {
    display: none !important;
  }

  .navbar-nav.d-xl-flex,
  .d-xl-flex {
    display: flex !important;
  }
}

@media (max-width: 1199.98px) {
  .navbar-toggler {
    display: block !important;
  }

  .mobile-menu {
    display: block !important;
  }

  .navbar-nav.d-xl-flex,
  .d-xl-flex {
    display: none !important;
  }

  .notification-dropdown-menu {
    right: 1rem !important;
    left: 1rem !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 95vw !important;
  }
}

/* container-fluid: 1200px 기준만 남김 */
.container-fluid {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 1199.98px) {
  .container-fluid {
    max-width: 100%;
    padding: 0 1rem;
  }
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.custom-modal-content {
  background: #fff;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 24px 20px 20px 20px;
  position: relative;
}

.custom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.custom-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.custom-modal-body {
  font-size: 1rem;
  color: #222;
}

.notification-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-actions {
  display: flex;
  gap: 0.7rem;
  align-items: center;
}

.notification-delete-btn {
  background: none;
  border: 1.5px solid #d32f2f;
  color: #d32f2f;
  font-size: 1.1rem;
  margin-left: 0.2rem;
  cursor: pointer;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  transition: background 0.2s, border 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.notification-delete-btn .delete-text {
  display: inline-block;
  margin-left: 0.3em;
  font-size: 1em;
  color: #d32f2f;
  font-weight: 500;
  vertical-align: middle;
}

@media (max-width: 500px) {
  .notification-delete-btn .delete-text {
    display: none;
  }
}

.notification-delete-btn:hover {
  background: #ffeaea;
  color: #b71c1c;
  border-color: #b71c1c;
}

.custom-modal-close.right-top {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 10;
}

.notification-delete-btn.modal-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px auto 0 auto;
  width: 120px;
  font-size: 1.05rem;
}

.modern-modal {
  background: #fff;
  border-radius: 18px;
  max-width: 380px;
  width: 92%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 1.5px 8px rgba(33, 150, 243, 0.08);
  padding: 32px 24px 28px 24px;
  position: relative;
  border: 1.5px solid #e3eaf5;
  animation: modalPop 0.22s cubic-bezier(.4, 1.6, .6, 1) 1;
}

@keyframes modalPop {
  0% {
    transform: scale(0.95);
    opacity: 0.2;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modern-modal-header {
  border-bottom: 1.5px solid #e3eaf5;
  padding-bottom: 0.7rem;
  margin-bottom: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1976d2;
  letter-spacing: 0.01em;
}

.modern-modal-body {
  padding: 0.2rem 0 0.5rem 0;
  min-height: 60px;
}

.modern-modal-content {
  font-size: 1.02rem;
  color: #222;
  margin-bottom: 0.7rem;
  word-break: break-all;
}

.modern-modal-time {
  font-size: 0.92rem;
  color: #90a4ae;
  text-align: right;
  margin-bottom: 0.2rem;
}

.modern-modal-delete {
  margin-top: 18px;
  width: 100%;
  border-radius: 8px;
  font-size: 1.08rem;
  font-weight: 500;
  background: #fff;
  border: 1.5px solid #d32f2f;
  color: #d32f2f;
  transition: background 0.18s, color 0.18s, border 0.18s;
  box-shadow: 0 1.5px 8px rgba(211, 47, 47, 0.04);
}

.modern-modal-delete:hover {
  background: #ffeaea;
  color: #b71c1c;
  border-color: #b71c1c;
}

@media (max-width: 500px) {
  .modern-modal {
    padding: 18px 6px 16px 6px;
    max-width: 98vw;
  }

  .modern-modal-title {
    font-size: 1.01rem;
  }

  .modern-modal-delete {
    font-size: 0.98rem;
    padding: 0.7em 0.2em;
  }
}

.mobile-menu-user-block {
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.1rem;
  padding: 0 0.5rem;
}

.mobile-menu-user-info {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.user-name {
  font-weight: bold;
  font-size: 1.15em;
}

.mobile-menu-user-actions {
  display: flex;
  gap: 0.7rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

.mobile-btn-page, .mobile-btn-logout {
  flex: 1 1 0;
  display: inline-block;
  text-align: center;
  border-radius: 8px;
  font-size: 1.08em;
  padding: 0.7em 0.5em;
  font-weight: 700;
  transition: background 0.18s, color 0.18s, border 0.18s;
  box-shadow: 0 1px 4px rgba(25, 118, 237, 0.06);
}

.mobile-btn-page {
  border: 2px solid #1976ed;
  background: #f1f5fa;
  color: #1976ed;
}

.mobile-btn-page:hover {
  background: #1976ed;
  color: #fff;
}

.mobile-btn-logout {
  border: 2px solid #e74c3c;
  color: #e74c3c;
  background: #fff;
}

.mobile-btn-logout:hover {
  background: #e74c3c;
  color: #fff;
}

.mobile-btn-reservation {
  width: 100%;
  margin-top: 0.2rem;
  border: 1.5px solid #1976ed;
  background: #f8fafc;
  color: #1976ed;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1em;
  padding: 0.6em 0.5em;
  text-align: center;
  transition: background 0.18s, color 0.18s, border 0.18s;
}

.mobile-btn-reservation:hover {
  background: #1976ed;
  color: #fff;
}

.mobile-menu-login-btns {
  gap: 0.5rem;
  margin-bottom: 1rem;
}
</style>