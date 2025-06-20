<template>
  <div class="reservation-detail">
    <div class="header">
      <h1 class="page-title">예약 상세 정보</h1>
      <button class="back-button" @click="$router.push('/partner/reservations')">목록으로</button>
    </div>

    <div v-if="reservation" class="detail-card">
      <div class="status-section">
        <h2>{{ reservation.productName || '상품명 없음' }}</h2>
        <span :class="['status-badge', (reservation.reservationStatus || '').toLowerCase()]">
          {{ getStatusText(reservation.reservationStatus) }}
        </span>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <label>예약자</label>
          <p>{{ reservation.userName }}</p>
        </div>
        <div class="info-item">
          <label>예약일</label>
          <p>{{ formatDate(reservation.fishingAt) }}</p>
        </div>
        <div class="info-item">
          <label>인원</label>
          <p>{{ reservation.numPerson }}명</p>
        </div>
        <div class="info-item">
          <label>옵션</label>
          <p>{{ reservation.optionName }}</p>
        </div>
        <div class="info-item">
          <label>결제방법</label>
          <p>{{ reservation.paymentsMethod }}</p>
        </div>
        <div class="info-item">
          <label>결제일시</label>
          <p>{{ formatDateTime(reservation.paidAt) }}</p>
        </div>
        <div class="info-item">
          <label>예약일시</label>
          <p>{{ formatDateTime(reservation.createdAt) }}</p>
        </div>
      </div>

      <div class="action-buttons" v-if="reservation.reservationStatus === 'PENDING' || reservation.reservationStatus === 'PAID'">
        <button class="cancel-button" @click="cancelReservation">예약 취소</button>
      </div>
    </div>

    <div v-else class="loading">
      로딩 중...
    </div>
  </div>
</template>

<script>
import { partnerService } from '@/api/partner';

export default {
  name: 'ReservationDetail',
  data() {
    return {
      reservation: null
    }
  },
  methods: {
    async loadReservationDetail() {
      try {
        const reservationId = this.$route.params.id;
        const response = await partnerService.getReservationDetail(reservationId);
        console.log('예약 상세 API 응답:', response.data);
        this.reservation = {
          ...response.data,
          productName: response.data.prod_name || '상품명 없음'
        };
        console.log('매핑된 예약 상세:', this.reservation);
      } catch (error) {
        console.error('예약 상세 정보 로딩 실패:', error);
        alert('예약 정보를 불러오는데 실패했습니다.');
        this.$router.push('/partner/reservations');
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatDateTime(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
    async cancelReservation() {
      if (!confirm('예약을 취소하시겠습니까?')) return;
      
      try {
        await partnerService.cancelReservation(this.reservation.reservationId);
        alert('예약이 취소되었습니다.');
        await this.loadReservationDetail();
      } catch (error) {
        console.error('예약 취소 실패:', error);
        if (error.response?.status === 403) {
          alert('해당 예약을 취소할 수 없습니다.');
        } else {
          alert('예약 취소에 실패했습니다.');
        }
      }
    }
  },
  mounted() {
    this.loadReservationDetail();
  }
}
</script>

<style scoped>
.reservation-detail {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.page-title {
  margin: 0;
  color: #1a237e;
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.back-button {
  padding: 10px 20px;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #555;
  transform: translateY(-2px);
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  border: 1px solid #e0e0e0;
}

.status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.status-section h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3e0;
  color: #ef6c00;
}

.status-badge.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.canceled {
  background: #ffebee;
  color: #c62828;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  margin-bottom: 30px;
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  border: 1px solid #eef2f7;
}

.info-item label {
  display: block;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 10px;
  font-weight: 500;
}

.info-item p {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 10px 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.cancel-button {
  padding: 12px 24px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.loading {
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .reservation-detail {
    padding: 20px;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .page-title {
    font-size: 2rem;
  }

  .status-section {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .status-section h2 {
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
  }

  .info-item p {
    padding: 8px 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .cancel-button {
    width: 100%;
    padding: 10px;
    font-size: 0.9rem;
  }
}
</style> 