<template>
  <nav class="navbar navbar-light bg-light fixed-top border-bottom px-3">
    <div class="container-fluid ps-0" style="max-width: 80%;">

      <!-- 로고 -->
      <router-link to="/" class="navbar-brand fs-3">DΛGON</router-link>

      <!-- 메인 네비게이션 -->
      <ul class="navbar-nav d-flex flex-row gap-4 position-absolute start-50 translate-middle-x">
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

        <template v-if="!isLoggedIn">
          <router-link to="/signup" class="btn btn-outline-secondary btn-sm">회원가입</router-link>
          <router-link to="/login" class="btn btn-outline-secondary btn-sm">로그인</router-link>
        </template>

        <template v-else>
          <div class="dropdown">
            <a class="dropdown-toggle d-flex align-items-center text-dark text-decoration-none"
               href="#" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <img :src="user.profileImage" class="rounded-circle me-2" width="32" height="32"/>
              {{ user.name }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/profile">내 정보</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/reservations">예약조회</router-link>
              </li>
              <li>
                <hr class="dropdown-divider"/>
              </li>
              <li><a class="dropdown-item" href="#" @click="logout">로그아웃</a></li>
            </ul>
          </div>
        </template>

        <!-- 🔴 신고하기 버튼-->
        <router-link to="/report"
                     class="text-danger fs-4"
                     title="신고하기"
                     style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;">
          <SirenIcon />
        </router-link>
      </div>

    </div>
  </nav>

</template>

<script setup>
import {ref} from 'vue'
import SirenIcon from '@/components/icons/SirenIcon.vue'

const isLoggedIn = ref(false)
const user = ref({
  name: '홍길동',
  profileImage: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
})

const logout = () => {
  alert('로그아웃되었습니다.')
  isLoggedIn.value = false
}

const menuItems =ref( [
  {
    label: '조황센터',
    link: '/fishing-center',
    open:false,
    children: [
      {label: '조황정보', link: '/report'},
      {label: '조행기', link: '/diary'}
    ]
  },
  {label: '바다낚시', link: '/sea'},
  {label: '민물낚시', link: '/freshwater'},
  {
    label: '커뮤니티',
    link: '/event',
    open:false,
    children: [
      // {label: '자유게시판', link: 'free'},
      {label: '이벤트', link: '/event'},
      {label: '조황센터', link: '/fishing-center'}
    ]
  },
  {
    label: '고객센터',
    link:  '/notice',
    open:false,
    children: [
      {label: '공지사항', link: '/notice'},
      {label: '자주묻는질문', link: '/faq'},
      {label: '1:1 문의', link: '/inquiry'}
    ]
  }
])
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

</style>