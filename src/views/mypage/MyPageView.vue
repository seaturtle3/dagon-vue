<template>
  <div class="mypage-container">
    <div class="sidebar">
      <h2 class="sidebar-title">마이페이지</h2>
      <nav class="sidebar-nav">
        <router-link to="/mypage/profile" class="nav-item" active-class="active">
          <i class="fas fa-user"></i>
          회원정보
        </router-link>
        <router-link to="/mypage/password" class="nav-item" active-class="active">
          <i class="fas fa-lock"></i>
          비밀번호 변경
        </router-link>
        <router-link to="/mypage/points" class="nav-item" active-class="active">
          <i class="fas fa-coins"></i>
          포인트 조회
        </router-link>
        <router-link to="/mypage/reservations" class="nav-item" active-class="active">
          <i class="fas fa-calendar-alt"></i>
          예약 현황
        </router-link>
        <router-link to="/mypage/notifications" class="nav-item" active-class="active">
          <i class="fas fa-bell"></i>
          내 알람
        </router-link>
        <router-link to="/mypage/withdrawal" class="nav-item" active-class="active">
          <i class="fas fa-user-minus"></i>
          회원 탈퇴
        </router-link>
      </nav>
    </div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
// Font Awesome CDN 추가
const fontAwesomeScript = document.createElement('link');
fontAwesomeScript.rel = 'stylesheet';
fontAwesomeScript.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
document.head.appendChild(fontAwesomeScript);
</script>

<style scoped>
.mypage-container {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #f1f3f5;
  padding: 2rem;
  gap: 2rem;
}

.sidebar {
  width: 280px;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: #495057;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #1a73e8;
}

.nav-item.active {
  background: #e8f0fe;
  color: #1a73e8;
  font-weight: 500;
}

.nav-item i {
  width: 20px;
  text-align: center;
}

.content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .mypage-container {
    flex-direction: column;
    padding: 1rem;
  }

  .sidebar {
    width: 100%;
  }
}
</style> 