<template>
  <div class="reservation-list">
    <h1 class="page-title">예약 관리</h1>
    
    <div class="filter-section">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="상품명을 입력하세요">
        <button class="search-button" @click="searchReservations">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-icon-white" />
        </button>
      </div>
      
      <div class="filter-options">
        <select v-model="statusFilter" @change="filterReservations">
          <option value="all">전체</option>
          <option value="PENDING">대기</option>
          <option value="PAID">결제완료</option>
          <option value="CANCELED">취소됨</option>
        </select>
      </div>
    </div>

    <div class="reservation-table">
      <div class="table-header">
        <div class="header-item">상품명</div>
        <div class="header-item">예약자</div>
        <div class="header-item">예약일</div>
        <div class="header-item">인원</div>
        <div class="header-item">결제방법</div>
        <div class="header-item">상태</div>
        <div class="header-item">관리</div>
      </div>

      <div v-for="reservation in filteredReservations" :key="reservation.reservationId" 
        class="reservation-row"
        :class="{ 'deleted': reservation.reservationStatus === 'CANCELED' }">
        <div class="row-item">
          <span v-if="reservation.reservationStatus === 'CANCELED'" class="deleted-mark">
            <i class="fas fa-times"></i>
          </span>
          {{ reservation.productName || '상품명 없음' }}
        </div>
        <div class="row-item">{{ reservation.userName }}</div>
        <div class="row-item">{{ formatDate(reservation.fishingAt) }}</div>
        <div class="row-item">{{ reservation.numPerson }}명</div>
        <div class="row-item">{{ reservation.paymentsMethod }}</div>
        <div class="row-item">
          <span :class="['status-badge', (reservation.reservationStatus || '').toLowerCase()]">
            {{ getStatusText(reservation.reservationStatus) }}
          </span>
        </div>
        <div class="row-item actions">
          <button 
            v-if="reservation.reservationStatus === 'PENDING'"
            class="cancel-button"
            @click="cancelReservation(reservation.reservationId)"
          >
            취소
          </button>
          
          <button 
            class="detail-button"
            @click="viewReservationDetail(reservation.reservationId)"
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
      return this.reservations
        .slice()
        .sort((a, b) => new Date(b.createdAt || b.fishingAt) - new Date(a.createdAt || a.fishingAt))
        .filter(reservation => {
          const matchesSearch = 
            (reservation.productName?.toLowerCase() || '').includes(this.searchQuery.toLowerCase()) ||
            (reservation.userName?.toLowerCase() || '').includes(this.searchQuery.toLowerCase());
          const matchesStatus = this.statusFilter === 'all' || 
            (reservation.reservationStatus || '').toUpperCase() === this.statusFilter;
          return matchesSearch && matchesStatus;
        });
    }
  },
  methods: {
    async loadReservations() {
      try {
        const response = await partnerService.getPartnerReservations();
        console.log('예약 목록 API 응답:', response.data);
        this.reservations = response.data.map(reservation => ({
          ...reservation,
          productName: reservation.productName || reservation.prod_name || reservation.product_name || '상품명 없음'
        }));
        console.log('매핑된 예약 목록:', this.reservations);
      } catch (error) {
        console.error('예약 목록 로딩 실패:', error);
        alert('예약 목록을 불러오는데 실패했습니다.');
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    getStatusText(status) {
      if (!status) return '상태 없음';
      
      const statusMap = {
        'PENDING': '대기',
        'PAID': '결제완료',
        'CANCELED': '취소됨'
      };
      return statusMap[status.toUpperCase()] || status;
    },
    async cancelReservation(id) {
      if (!confirm('예약을 취소하시겠습니까?')) return;
      
      try {
        await partnerService.cancelReservation(id);
        await this.loadReservations();
        alert('예약이 취소되었습니다.');
      } catch (error) {
        console.error('예약 취소 실패:', error);
        if (error.response?.status === 403) {
          alert('해당 예약을 취소할 수 없습니다.');
        } else {
          alert('예약 취소에 실패했습니다.');
        }
      }
    },
    viewReservationDetail(id) {
      this.$router.push(`/partner/reservations/${id}`);
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
  padding: 30px;
  width: 100%;
  margin: 0;
  background-color: #e3f2fd;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin-bottom: 40px;
  color: #1565c0;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  gap: 20px;
  border: 1px solid #90caf9;
}

.search-box {
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: 500px;
}

.search-box input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.search-button {
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.3s ease;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
}

.search-button:hover {
  background-color: #1565c0;
  transform: translateY(-2px);
}

.filter-options select {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-options select:focus {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  outline: none;
}

.reservation-table {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 0.8fr 1fr 1fr 1.2fr;
  padding: 15px 20px;
  background: #eef2f7;
  border-bottom: 2px solid #eee;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  font-size: 0.95rem;
}

.reservation-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 0.8fr 1fr 1fr 1.2fr;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  font-size: 0.95rem;
}

.reservation-row:last-child {
  border-bottom: none;
}

.reservation-row:hover {
  background: #f8f9fa;
}

.header-item, .row-item {
  padding: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
}

.status-badge.pending {
  background-color: #64b5f6;
  color: #fff;
}

.status-badge.paid {
  background-color: #43a047;
  color: #fff;
}

.status-badge.canceled {
  background-color: #e53935;
  color: #fff;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-button {
  background-color: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.detail-button {
  background-color: #3498db;
  color: white;
}

.detail-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.no-reservations {
  text-align: center;
  padding: 80px;
  color: #666;
  font-size: 1.3rem;
  background: #ffffff;
  border-radius: 10px;
  border: 1px dashed #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-top: 30px;
}

.reservation-row.deleted {
  opacity: 0.85;
  background-color: #f8f9fa;
  border-left: 4px solid #dc3545;
}

.deleted-mark {
  color: #dc3545;
  font-size: 0.9em;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.deleted-mark i {
  font-size: 1em;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .reservation-list {
    padding: 20px;
  }

  .page-title {
    font-size: 2rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .search-box {
    max-width: 100%;
  }

  .filter-options {
    width: 100%;
    justify-content: space-between;
  }

  .reservation-table {
    overflow-x: auto;
  }

  .table-header, .reservation-row {
    grid-template-columns: minmax(150px, 1.5fr) repeat(6, minmax(100px, 1fr));
  }

  .table-header {
    padding: 15px 10px;
  }

  .reservation-row {
    padding: 15px 10px;
  }

  .actions button {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .table-header {
    display: none; /* Hide table header on small screens */
  }

  .reservation-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border: 1px solid #eee;
    margin-bottom: 15px;
    border-radius: 8px;
    padding: 15px;
  }

  .row-item {
    width: 100%;
    padding: 5px 0;
    text-align: left;
  }

  .row-item:first-child {
    font-weight: bold;
    font-size: 1.1rem;
    color: #1a237e;
    margin-bottom: 10px;
  }

  .row-item.actions {
    justify-content: flex-end;
    width: 100%;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
  }
}

.search-icon-white {
  color: #fff;
  font-size: 1.2em;
}
</style> 