<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top border-bottom px-3">
    <router-link to="/" class="navbar-brand d-flex align-items-center">
      <span class="fs-3 me-2">🐡</span>
    </router-link>

    <div class="d-flex justify-content-between align-items-center w-100">
      <ul class="navbar-nav mx-auto d-flex flex-row gap-4">
        <li class="nav-item"><router-link class="nav-link" to="/fishing-report">조황센터</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/sea-fishing">바다낚시</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="/freshwater-fishing">민물낚시</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="#">커뮤니티</router-link></li>
        <li class="nav-item"><router-link class="nav-link" to="#">고객센터</router-link></li>
      </ul>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm">로그인</button>
        <button class="btn btn-outline-success btn-sm">회원가입</button>
        <button class="btn btn-outline-danger btn-sm">신고하기</button>
      </div>
    </div>
  </nav>
</template>
