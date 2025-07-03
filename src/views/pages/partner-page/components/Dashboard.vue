<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>대시보드</h2>
      <p class="last-updated">마지막 업데이트: {{ formatDate(new Date()) }}</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>데이터를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="retry-button">다시 시도</button>
    </div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <h3>전체 예약</h3>
            <p class="stat-value">{{ reservationCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-content">
            <h3>전체 상품</h3>
            <p class="stat-value">{{ productCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fa-solid fa-address-book"></i>
          </div>
          <div class="stat-content">
            <h3>오늘의 예약</h3>
            <p class="stat-value">{{ todayReservationCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <div class="stat-content">
            <h3>대기 문의</h3>
            <p class="stat-value">{{ unansweredInquiryCount }}</p>
          </div>
        </div>
      </div>

      <div class="recent-reservations">
        <div class="section-header">
          <h3>최근 예약</h3>
          <button @click="$router.push('/partner/reservations')" class="view-all-button">
            전체 보기
          </button>
        </div>

        <div v-if="recentReservations.length === 0" class="no-data">
          <i class="fas fa-calendar-times"></i>
          <p>최근 예약이 없습니다.</p>
        </div>

        <div v-else class="reservation-list">
          <div v-for="reservation in sortedRecentReservations"
               :key="reservation.reservationId"
               class="reservation-card"
               :class="{ 'cancelled': reservation.status === 'CANCELLED' || reservation.status === 'CANCELED' }">
            <div class="reservation-info">
              <div class="reservation-header">
                <h4>{{ reservation.productName }}</h4>
                <span v-if="reservation.status === 'CANCELLED' || reservation.status === 'CANCELED'" class="status-badge status-cancelled">❌ 취소됨</span>
                <span v-else :class="['status-badge', getStatusClass(reservation.status)]">
                  {{ getStatusText(reservation.status) }}
                </span>
              </div>
              <div class="reservation-details">
                <p><i class="fas fa-user"></i> {{ reservation.userName }}</p>
                <p><i class="fa-solid fa-circle-user"></i> {{ reservation.numPerson }}명</p>
                <p><i class="fas fa-clock"></i> {{ formatDate(reservation.fishingAt) }}</p>
              </div>
            </div>
            <button @click="viewReservation(reservation.reservationId)"
                    class="view-button">
              상세보기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {partnerService} from '@/api/partner'

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      error: null,
      reservationCount: 0,
      productCount: 0,
      todayReservationCount: 0,
      unansweredInquiryCount: 0,
      recentReservations: []
    }
  },
  computed: {
    sortedRecentReservations() {
      return [...this.recentReservations]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
    }
  },
  methods: {
    async loadDashboardData() {
      this.loading = true
      this.error = null

      try {
        // uno 결정: 쿼리스트링 > 토큰
        let uno = this.$route.query.uno;
        
        // 쿼리스트링에 uno가 없으면 토큰에서 추출
        if (!uno) {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              uno = payload.uno;
            } catch (e) {
              console.error('토큰 파싱 실패:', e);
            }
          }
        }
        
        // 예약 수 조회
        console.log('🔍 예약 수 조회 API 호출:', uno);
        const reservationResponse = await partnerService.getReservationCount(uno)
        console.log('📊 예약 수 응답:', reservationResponse.data);
        this.reservationCount = reservationResponse.data

        // 전체 상품 수 조회
        console.log('🔍 상품 수 조회 API 호출:', uno);
        const productCountResponse = await partnerService.getProductCount(uno)
        console.log('📊 상품 수 응답:', productCountResponse.data);
        this.productCount = productCountResponse.data

        // 오늘 예약 수 조회
        console.log('🔍 오늘 예약 수 조회 API 호출:', uno);
        const todayReservationResponse = await partnerService.getTodayReservationCount(uno)
        console.log('📊 오늘 예약 수 응답:', todayReservationResponse.data);
        this.todayReservationCount = todayReservationResponse.data

        // 대기 문의 수 조회
        console.log('🔍 대기 문의 수 조회 API 호출:', uno);
        const inquiryResponse = await partnerService.getUnansweredInquiryCount(uno)
        console.log('📊 대기 문의 수 응답:', inquiryResponse.data);
        this.unansweredInquiryCount = inquiryResponse.data

        // 최근 예약 목록 조회
        try {
          const recentReservationsResponse = await partnerService.getRecentReservations(uno)
          if (Array.isArray(recentReservationsResponse.data)) {
            this.recentReservations = recentReservationsResponse.data.map(reservation => ({
              reservationId: reservation.reservationId,
              createdAt: reservation.createdAt,
              fishingAt: reservation.fishingAt,
              numPerson: reservation.numPerson,
              status: reservation.reservationStatus,
              userName: reservation.userName,
              productName: reservation.productName,
              userPhone: reservation.userPhone
            }))
          } else {
            this.recentReservations = []
          }
        } catch (reservationError) {
          console.error('최근 예약 조회 실패:', reservationError)
          this.recentReservations = []
        }
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error)
        this.error = '데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        // 임시 데이터로 대체
        this.reservationCount = 15
        this.productCount = 8
        this.todayReservationCount = 3
        this.unansweredInquiryCount = 2
        this.recentReservations = []
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return '날짜 없음'
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getStatusText(status) {
      if (!status) return '상태 없음'
      const statusMap = {
        'PENDING': '대기',
        'PAID': '결제완료',
        'CANCELED': '취소됨',
        'CANCELLED': '취소됨'
      }
      return statusMap[status] || status
    },
    getStatusClass(status) {
      const statusClassMap = {
        'PENDING': 'status-pending',
        'PAID': 'status-paid',
        'CANCELED': 'status-cancelled',
        'CANCELLED': 'status-cancelled'
      }
      return statusClassMap[status] || ''
    },
    formatPrice(price) {
      return price.toLocaleString()
    },
    viewReservation(id) {
      this.$router.push(`/partner/reservations/${id}`)
    }
  },
  mounted() {
    this.loadDashboardData()
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
  background: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  margin-left: 250px;
  background: #f8f9fa;
  min-height: 100vh;
}

.dashboard {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8em;
}

.last-updated {
  color: #6c757d;
  font-size: 0.9em;
  margin: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.status-cancelled {
  background-color: #f8d7da;
  color: #c82333;
  font-weight: bold;
}

.error {
  text-align: center;
  color: #e74c3c;
  padding: 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.retry-button {
  margin-top: 16px;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #2980b9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #e3f2fd;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 24px;
  color: #3498db;
}

.stat-content h3 {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 1em;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.recent-reservations {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4em;
}

.view-all-button {
  padding: 8px 16px;
  background-color: #e3f2fd;
  color: #3498db;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
}

.view-all-button:hover {
  background-color: #3498db;
  color: white;
}

.no-data {
  text-align: center;
  padding: 48px;
  color: #6c757d;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #dee2e6;
}

.reservation-list {
  display: grid;
  gap: 16px;
}

.reservation-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s;
  position: relative;
}

.reservation-card:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reservation-card.cancelled::before {
  content: '❌';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: rgba(200, 35, 51, 0.2);
  z-index: 1;
  pointer-events: none;
}

.reservation-card.cancelled {
  opacity: 0.7;
  background: #fff5f5;
  border: 1px solid #f8d7da;
}

.reservation-card.cancelled .reservation-info {
  position: relative;
  z-index: 2;
}

.reservation-card.cancelled .view-button {
  position: relative;
  z-index: 2;
}

.reservation-info {
  display: flex;
  flex-direction: column;
}

.reservation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.reservation-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2em;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-paid {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.reservation-details {
  display: grid;
  gap: 8px;
}

.reservation-details p {
  margin: 0;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reservation-details i {
  width: 16px;
  color: #adb5bd;
}

.view-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.3s;
}

.view-button:hover {
  background-color: #2980b9;
}
</style> 