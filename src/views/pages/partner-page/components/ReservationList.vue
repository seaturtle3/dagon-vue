<template>
  <div class="reservation-list">
    <h1 class="page-title">예약 관리</h1>
    
    <div class="filter-section">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="예약자명 또는 상품명을 입력하세요">
        <button class="search-button" @click="searchReservations">검색</button>
      </div>
      
      <div class="filter-options">
        <select v-model="statusFilter" @change="filterReservations">
          <option value="all">전체</option>
          <option value="PENDING">대기중</option>
          <option value="CONFIRMED">확정</option>
          <option value="CANCELLED">취소됨</option>
        </select>
      </div>
    </div>

    <div class="reservation-grid">
      <div v-for="reservation in filteredReservations" :key="reservation.id" class="reservation-card">
        <div class="reservation-header">
          <h3>{{ reservation.productName }}</h3>
          <span :class="['status-badge', reservation.status.toLowerCase()]">
            {{ getStatusText(reservation.status) }}
          </span>
        </div>
        
        <div class="reservation-info">
          <div class="info-item">
            <label>예약자</label>
            <p>{{ reservation.userName }}</p>
          </div>
          <div class="info-item">
            <label>예약일</label>
            <p>{{ formatDate(reservation.reservationDate) }}</p>
          </div>
          <div class="info-item">
            <label>인원</label>
            <p>{{ reservation.personCount }}명</p>
          </div>
          <div class="info-item">
            <label>금액</label>
            <p>{{ formatPrice(reservation.totalPrice) }}원</p>
          </div>
        </div>

        <div class="reservation-actions">
          <button 
            v-if="reservation.status === 'PENDING'"
            class="confirm-button"
            @click="confirmReservation(reservation.id)"
          >
            확정
          </button>
          <button 
            v-if="reservation.status === 'PENDING'"
            class="cancel-button"
            @click="cancelReservation(reservation.id)"
          >
            취소
          </button>
          <button 
            class="detail-button"
            @click="viewReservationDetail(reservation.id)"
          >
            상세보기
          </button>
        </div>
      </div>
    </div>

    <div v-if="reservations.length === 0" class="no-reservations">
      예약 내역이 없습니다.
    </div>
  </div>
</template>

<script>
import { partnerService } from '@/api/partner'

export default {
  name: 'ReservationList',
  data() {
    return {
      searchQuery: '',
      statusFilter: 'all',
      reservations: []
    }
  },
  computed: {
    filteredReservations() {
      return this.reservations.filter(reservation => {
        const matchesSearch = 
          reservation.productName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          reservation.userName.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesStatus = this.statusFilter === 'all' || reservation.status === this.statusFilter
        return matchesSearch && matchesStatus
      })
    }
  },
  methods: {
    async loadReservations() {
      try {
        // API 연동 전 임시 데이터
        this.reservations = [
          {
            id: 1,
            productName: '바다낚시 체험',
            userName: '홍길동',
            reservationDate: '2024-03-15',
            personCount: 2,
            totalPrice: 100000,
            status: 'PENDING'
          },
          {
            id: 2,
            productName: '민물낚시 체험',
            userName: '김철수',
            reservationDate: '2024-03-16',
            personCount: 3,
            totalPrice: 150000,
            status: 'CONFIRMED'
          },
          {
            id: 3,
            productName: '선상낚시 체험',
            userName: '이영희',
            reservationDate: '2024-03-17',
            personCount: 4,
            totalPrice: 200000,
            status: 'CANCELLED'
          }
        ]
      } catch (error) {
        console.error('예약 목록 로딩 실패:', error)
        alert('예약 목록을 불러오는데 실패했습니다.')
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    getStatusText(status) {
      const statusMap = {
        'PENDING': '대기중',
        'CONFIRMED': '확정',
        'CANCELLED': '취소됨'
      }
      return statusMap[status] || status
    },
    async confirmReservation(id) {
      if (!confirm('예약을 확정하시겠습니까?')) return
      
      try {
        await partnerService.confirmReservation(id)
        await this.loadReservations()
        alert('예약이 확정되었습니다.')
      } catch (error) {
        console.error('예약 확정 실패:', error)
        alert('예약 확정에 실패했습니다.')
      }
    },
    async cancelReservation(id) {
      if (!confirm('예약을 취소하시겠습니까?')) return
      
      try {
        await partnerService.cancelReservation(id)
        await this.loadReservations()
        alert('예약이 취소되었습니다.')
      } catch (error) {
        console.error('예약 취소 실패:', error)
        alert('예약 취소에 실패했습니다.')
      }
    },
    viewReservationDetail(id) {
      this.$router.push(`/partner/reservations/${id}`)
    },
    searchReservations() {
      // 검색 로직은 computed 속성에서 처리됨
    },
    filterReservations() {
      // 필터링 로직은 computed 속성에서 처리됨
    }
  },
  mounted() {
    this.loadReservations()
  }
}
</script>

<style scoped>
.reservation-list {
  padding: 20px;
}

.page-title {
  margin-bottom: 30px;
  color: #333;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
}

.search-button {
  padding: 8px 16px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-options select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.reservation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.reservation-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.reservation-header h3 {
  margin: 0;
  color: #333;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.pending {
  background: #fff3e0;
  color: #ef6c00;
}

.status-badge.confirmed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.cancelled {
  background: #ffebee;
  color: #c62828;
}

.reservation-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.info-item label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.info-item p {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.reservation-actions {
  display: flex;
  gap: 10px;
}

.reservation-actions button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.confirm-button {
  background: #2e7d32;
  color: white;
}

.confirm-button:hover {
  background: #1b5e20;
}

.cancel-button {
  background: #c62828;
  color: white;
}

.cancel-button:hover {
  background: #b71c1c;
}

.detail-button {
  background: #1a237e;
  color: white;
}

.detail-button:hover {
  background: #283593;
}

.no-reservations {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}
</style> 