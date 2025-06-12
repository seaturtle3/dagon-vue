<template>
  <div class="dashboard">
    <h1>대시보드</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <i class="fas fa-box"></i>
        <div class="stat-info">
          <h3>전체 상품</h3>
          <p>{{ stats.totalProducts }}개</p>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-calendar-check"></i>
        <div class="stat-info">
          <h3>이번 달 예약</h3>
          <p>{{ stats.monthlyReservations }}건</p>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-won-sign"></i>
        <div class="stat-info">
          <h3>이번 달 매출</h3>
          <p>{{ formatPrice(stats.monthlyRevenue) }}원</p>
        </div>
      </div>
      
      <div class="stat-card">
        <i class="fas fa-question-circle"></i>
        <div class="stat-info">
          <h3>대기 문의</h3>
          <p>{{ stats.pendingInquiries }}건</p>
        </div>
      </div>
    </div>

    <div class="recent-reservations">
      <h2>최근 예약</h2>
      <div class="reservation-list">
        <div v-for="reservation in recentReservations" 
             :key="reservation.id" 
             class="reservation-card">
          <div class="reservation-info">
            <h3>{{ reservation.productName }}</h3>
            <p class="date">{{ formatDate(reservation.date) }}</p>
            <p class="status" :class="reservation.status">
              {{ getStatusText(reservation.status) }}
            </p>
          </div>
          <button @click="viewReservation(reservation.id)" class="view-btn">
            상세보기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { partnerService } from '@/api/partner'

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        totalProducts: 0,
        monthlyReservations: 0,
        monthlyRevenue: 0,
        pendingInquiries: 0
      },
      recentReservations: []
    }
  },
  methods: {
    async loadDashboardData() {
      try {
        // API 연동 전 임시 데이터
        this.stats = {
          totalProducts: 12,
          monthlyReservations: 45,
          monthlyRevenue: 2500000,
          pendingInquiries: 3
        }
        
        this.recentReservations = [
          {
            id: 1,
            productName: '제주도 해산물 체험',
            date: '2024-03-15',
            status: 'confirmed'
          },
          {
            id: 2,
            productName: '부산 어시장 투어',
            date: '2024-03-14',
            status: 'pending'
          },
          {
            id: 3,
            productName: '인천 갯벌 체험',
            date: '2024-03-13',
            status: 'cancelled'
          }
        ]
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error)
      }
    },
    formatPrice(price) {
      return price.toLocaleString()
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    getStatusText(status) {
      const statusMap = {
        pending: '대기중',
        confirmed: '확정',
        cancelled: '취소됨'
      }
      return statusMap[status] || status
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
.dashboard {
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
}

.stat-card i {
  font-size: 2rem;
  color: #3498db;
  margin-right: 20px;
}

.stat-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #7f8c8d;
}

.stat-info p {
  margin: 5px 0 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.recent-reservations {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.recent-reservations h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.reservation-list {
  display: grid;
  gap: 15px;
}

.reservation-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
}

.reservation-info h3 {
  margin: 0;
  color: #2c3e50;
}

.reservation-info .date {
  color: #7f8c8d;
  margin: 5px 0;
}

.reservation-info .status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.status.pending {
  background-color: #f1c40f;
  color: white;
}

.status.confirmed {
  background-color: #2ecc71;
  color: white;
}

.status.cancelled {
  background-color: #e74c3c;
  color: white;
}

.view-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-btn:hover {
  background-color: #2980b9;
}
</style> 