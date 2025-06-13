<template>
  <div class="partner-page">
    <div class="sidebar">
      <div class="logo">
        <h2>파트너 센터</h2>
      </div>
      <nav>
        <router-link to="/partner/dashboard" class="nav-item">
          <i class="fa-solid fa-comments"></i>
          대시보드
        </router-link>
        <router-link to="/partner/info" class="nav-item">
          <i class="fas fa-building"></i>
          파트너 정보
        </router-link>
        <router-link to="/partner/inquiries" class="nav-item">
          <i class="fas fa-question-circle"></i>
          문의 관리
        </router-link>
        <router-link to="/partner/reservations" class="nav-item">
          <i class="fas fa-calendar-check"></i>
          예약 관리
        </router-link>
        <router-link to="/partner/products" class="nav-item">
          <i class="fas fa-calendar-alt"></i>
          상품 관리
        </router-link>
        <router-link to="/partner/market-info" class="nav-item">
          <i class="fas fa-chart-bar"></i>
          조황정보
        </router-link>
        <router-link to="/partner/withdrawal" class="nav-item">
          <i class="fa-solid fa-eye-slash"></i>
          탈퇴
        </router-link>
      </nav>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PartnerPage'
}
</script>

<style>
:root {
  --primary-color: #1e88e5;
  --primary-light: #64b5f6;
  --primary-dark: #1565c0;
  --secondary-color: #4fc3f7;
  --accent-color: #29b6f6;
  --background-color: #e3f2fd;
  --text-color: #2c3e50;
  --sidebar-bg: #ffffff;
  --hover-color: #e1f5fe;
  --border-color: #bbdefb;
}
</style>

<style scoped>
.partner-page {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.logo {
  padding: 0 20px;
  margin-bottom: 30px;
  text-align: center;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.nav-item:hover {
  background-color: #34495e;
}

.nav-item.router-link-active {
  background-color: #3498db;
  color: white;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 20px;
  background-color: #f5f6fa;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .partner-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 1rem;
  }

  .main-content {
    padding: 1rem;
  }
}

.withdrawal-link {
  margin-top: auto;
  color: #dc3545;
}

.withdrawal-link:hover {
  background-color: #fff5f5;
  color: #dc3545;
}

.withdrawal-link.router-link-active {
  background-color: #dc3545;
  color: white;
}
</style> 