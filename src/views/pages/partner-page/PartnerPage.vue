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

<style scoped>
.partner-page {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #ffffff;
  color: #2c3e50;
  padding: 20px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.logo {
  padding: 0 20px;
  margin-bottom: 30px;
  text-align: center;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #3498db;
  font-weight: 600;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 10px;
}

.nav-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
  color: #3498db;
}

.nav-item:hover {
  background-color: #f0f7ff;
  color: #3498db;
  transform: translateX(5px);
}

.nav-item.router-link-active {
  background-color: #3498db;
  color: white;
}

.nav-item.router-link-active i {
  color: white;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 20px;
  background-color: #f8f9fa;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .partner-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 1rem;
    position: relative;
    height: auto;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
}

.withdrawal-link {
  color: #e74c3c;
}
</style> 