<script setup>
import { ref } from 'vue'

const showSupport = ref(false)
</script>

<template>
  <nav class="navbar navbar-light bg-light fixed-top border-bottom px-3">
    <div class="container-fluid ps-0" style="max-width: 80%;">
      <div class="d-flex justify-content-between align-items-center w-100">

        <!-- 로고 -->
        <router-link to="/" class="navbar-brand fs-3">DΛGON</router-link>

        <!-- 메인 네비게이션 -->
        <ul class="navbar-nav d-flex flex-row gap-4 position-absolute start-50 translate-middle-x">
          <li class="nav-item"><router-link class="nav-link" to="/fishing-center">조황센터</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/sea-fishing">바다낚시</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/freshwater-fishing">민물낚시</router-link></li>

          <!-- 커뮤니티 -->
          <li class="nav-item"><router-link class="nav-link" to="/community">커뮤니티</router-link></li>

          <!-- 고객센터 -->
          <li class="nav-item position-relative"
              @mouseenter="showSupport = true"
              @mouseleave="showSupport = false">

            <a class="nav-link" href="javascript:void(0)">고객센터</a>

            <transition name="slide-fade">
              <ul v-if="showSupport" class="dropdown-menu-custom">
                <li><router-link class="dropdown-item" to="/notice">공지사항</router-link></li>
                <li><router-link class="dropdown-item" to="/faq">자주묻는질문</router-link></li>
                <li><router-link class="dropdown-item" to="/inquiry">1:1 문의</router-link></li>
              </ul>
            </transition>
          </li>
        </ul>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm">로그인</button>
          <button class="btn btn-outline-secondary btn-sm">회원가입</button>
          <button class="btn btn-outline-danger btn-sm">신고하기</button>
        </div>

      </div>
    </div>
  </nav>

</template>
<style>
.nav-link:hover {
  font-weight: bold;
}

.dropdown-menu-custom {
  list-style: none;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 999;
  background: white;
  border: 1px solid #ccc;
  padding: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 160px;
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