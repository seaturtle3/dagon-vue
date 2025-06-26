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
        <router-link to="/partner/fishing-diaries" class="nav-item">
          <i class="fas fa-file-alt"></i>
          조행기 관리
        </router-link>
        <router-link to="/partner/withdrawal" class="nav-item">
          <i class="fa-solid fa-eye-slash"></i>
          탈퇴
        </router-link>
      </nav>
      
      <!-- 로그아웃 버튼 -->
      <div class="logout-section">
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> 로그아웃
        </button>
      </div>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/axios'
import { adminAuth } from '@/api/admin.js'
import Dashboard from './components/Dashboard.vue'
import ProductList from './components/ProductList.vue'
import ProductRegister from './components/ProductRegister.vue'
import ReservationList from './components/ReservationList.vue'
import ReservationDetail from './components/ReservationDetail.vue'
import FishingReportManager from './components/FishingReportManager.vue'
import FishingReportDetail from './components/FishingReportDetail.vue'
import InquiryList from './components/InquiryList.vue'
import PartnerInfo from './components/PartnerInfo.vue'
import PartnerWithdrawal from './components/PartnerWithdrawal.vue'
import ProductFormView from './components/ProductFormView.vue'

export default {
  name: 'PartnerPage',
  components: {
    ProductFormView
  },
  mounted() {
    // 위임 토큰 체크 제거 - 단순 로그아웃만 사용
  },
  methods: {
    async logout() {
      try {
        // admin.js의 adminAuth.logout() 사용
        adminAuth.logout();
        
        console.log('로그아웃 성공');
        
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      } catch (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃하는데 실패했습니다.');
      }
    }
  }
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
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  top: 0;
  display: flex;
  flex-direction: column;
}

/* 위임 토큰인 경우 배너 높이만큼 sidebar top 조정 */
.partner-page:has(.admin-return-banner) .sidebar {
  top: 60px;
  height: calc(100vh - 60px);
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

nav {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #f8f9fa;
  border-left-color: #3498db;
  color: #3498db;
}

.nav-item.router-link-active {
  background-color: #e3f2fd;
  border-left-color: #1976d2;
  color: #1976d2;
  font-weight: 600;
}

.nav-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 위임 토큰인 경우 배너 높이만큼 main-content top 조정 */
.partner-page:has(.admin-return-banner) .main-content {
  margin-top: 60px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: relative;
    height: auto;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .admin-return-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

.withdrawal-link {
  color: #e74c3c;
}

/* 로그아웃 버튼 */
.logout-section {
  margin-top: auto;
  padding: 0 20px 20px 20px;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #e74c3c;
  background: none;
  border: none;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 0;
}

.logout-btn:hover {
  background-color: #fdf2f2;
  border-left-color: #e74c3c;
  color: #c0392b;
}

.logout-btn i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}
</style> 