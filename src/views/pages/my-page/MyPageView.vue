<template>
  <div class="mypage-container-wrapper">
  <div class="mypage-container">
    <div class="sidebar">
      <h2 class="sidebar-title">마이페이지</h2>
      <nav class="sidebar-nav">
        <router-link to="/mypage/profile" class="nav-item" active-class="active">
          <span class="material-icons">person</span>
          회원정보
        </router-link>
        <router-link to="/mypage/password" class="nav-item" active-class="active">
          <span class="material-icons">lock</span>
          비밀번호 변경
        </router-link>
        <router-link to="/mypage/points" class="nav-item" active-class="active">
          <span class="material-icons">stars</span>
          포인트 조회
        </router-link>
        <router-link to="/mypage/reservations" class="nav-item" active-class="active">
          <span class="material-icons">directions_boat</span>
          예약 현황
        </router-link>
        <router-link to="/mypage/inquiries" class="nav-item" active-class="active">
          <span class="material-icons">help</span>
          내 문의 내역
        </router-link>
        <router-link to="/mypage/notifications" class="nav-item" active-class="active">
          <span class="material-icons">notifications</span>
          내 알람
        </router-link>
        <router-link to="/mypage/withdrawal" class="nav-item" active-class="active">
          <span class="material-icons">person_remove</span>
          회원 탈퇴
        </router-link>
      </nav>
    </div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</div>
</template>

<script setup>
// Material Icons CDN 추가
const materialIconsLink = document.createElement('link');
materialIconsLink.rel = 'stylesheet';
materialIconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
document.head.appendChild(materialIconsLink);
</script>

<style scoped>
.mypage-container-wrapper{
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #e3f2fd, #bbdefb);
}

.mypage-container {
  display: flex;
  min-height: calc(100vh - 64px);
  padding: 1rem;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.sidebar {
  width: 240px;
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  height: fit-content;
  position: sticky;
  top: 1rem;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #0d47a1;
  text-align: center;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 0.75rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #1565c0;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-item:hover {
  background: rgba(25, 118, 210, 0.1);
  color: #0d47a1;
  transform: translateX(5px);
}

.nav-item.active {
  background: #1976d2;
  color: white;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.nav-item .material-icons {
  font-size: 1.25rem;
}

.content {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  backdrop-filter: blur(10px);
  min-width: 0;
}

@media (max-width: 768px) {
  .mypage-container {
    flex-direction: column;
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .sidebar {
    width: 100%;
    position: static;
    padding: 1rem;
  }

  .nav-item {
    padding: 0.75rem;
  }
}
</style> 