<template>
  <nav class="navbar navbar-light bg-light fixed-top border-bottom px-3">
    <div class="container-fluid ps-0" style="max-width: 80%;">
      <div class="d-flex justify-content-between align-items-center w-100">

        <router-link to="/" class="navbar-brand fs-3">DΛGON</router-link>

        <ul class="navbar-nav d-flex flex-row gap-4 position-absolute start-50 translate-middle-x">
          <li class="nav-item"><router-link class="nav-link" to="/fishing-center">조황센터</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/sea-fishing">바다낚시</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/freshwater-fishing">민물낚시</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/community">커뮤니티</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/customer-service">고객센터</router-link></li>
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
</style>