<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>관리자</h1>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item" active-class="nav-item-active" exact>
          <i class="fas fa-chart-bar"></i>
          <span>대시보드</span>
        </router-link>
        <router-link to="/admin/members" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-thumbs-up"></i>
          <span>회원 정보</span>
        </router-link>
        <router-link to="/admin/partners" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-handshake"></i>
          <span>파트너 관리</span>
        </router-link>
        <router-link to="/admin/partner-applications" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-file-alt"></i>
          <span>파트너 신청 목록</span>
        </router-link>
        <router-link to="/admin/reservations" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-calendar-check"></i>
          <span>예약 목록</span>
        </router-link>
        <router-link to="/admin/notifications" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-bell"></i>
          <span>알림</span>
        </router-link>
        <router-link to="/admin/reports" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-flag"></i>
          <span>신고 목록</span>
        </router-link>
        <router-link to="/admin/events" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-calendar-alt"></i>
          <span>이벤트</span>
        </router-link>
        <router-link to="/admin/notices" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-paper-plane"></i>
          <span>공지사항</span>
        </router-link>
        <router-link to="/admin/fishing-reports" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-bookmark"></i>
          <span>조황정보 관리</span>
        </router-link>
        <router-link to="/admin/fishing-diaries" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-building"></i>
          <span>조행기 관리</span>
        </router-link>
        <router-link to="/admin/faq" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-question-circle"></i>
          <span>FAQ</span>
        </router-link>
        <router-link to="/admin/inquiries" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-comments"></i>
          <span>회원 문의 관리</span>
        </router-link>
        <router-link to="/admin/guest-inquiries" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-user-slash"></i>
          <span>비회원 문의 관리</span>
        </router-link>
        <router-link to="/admin/register" class="nav-item" active-class="nav-item-active">
          <i class="fa-solid fa-user"></i>
          <span>관리자 회원가입</span>
        </router-link>
        <router-link to="/admin/logout" class="nav-item" active-class="nav-item-active">
          <i class="fas fa-eye-slash"></i>
          <span>로그아웃</span>
        </router-link>

      </nav>
    </aside>
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout'
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
}

.sidebar-header {
  padding: 1rem 0;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.sidebar-nav {
  margin-top: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item-active {
  background-color: #3498db !important;
  color: #fff !important;
}

.nav-item i {
  margin-right: 0.75rem;
  width: 20px;
  text-align: center;
}

.main-content {
  flex: 1;
  padding: 1rem;
  background-color: #f8f9fa;
}
</style> 