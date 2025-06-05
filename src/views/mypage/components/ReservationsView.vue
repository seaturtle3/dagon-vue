<template>
  <div class="reservations-container">
    <h2 class="page-title">예약 현황</h2>
    
    <div class="reservation-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-button"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="reservations-list">
      <div v-for="(reservation, index) in filteredReservations" :key="index" class="reservation-item">
        <div class="reservation-image">
          <img :src="reservation.image" :alt="reservation.name" />
        </div>
        <div class="reservation-info">
          <div class="reservation-header">
            <h3 class="accommodation-name">{{ reservation.name }}</h3>
            <span class="reservation-status" :class="reservation.status">
              {{ getStatusText(reservation.status) }}
            </span>
          </div>
          <div class="reservation-details">
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              {{ reservation.checkIn }} - {{ reservation.checkOut }}
            </div>
            <div class="detail-item">
              <i class="fas fa-user"></i>
              {{ reservation.guests }}명
            </div>
            <div class="detail-item">
              <i class="fas fa-won-sign"></i>
              {{ reservation.price.toLocaleString() }}원
            </div>
          </div>
        </div>
        <div class="reservation-actions">
          <button v-if="reservation.status === 'upcoming'" class="btn btn-danger" @click="cancelReservation(reservation.id)">
            예약 취소
          </button>
          <button v-if="reservation.status === 'completed'" class="btn btn-primary" @click="writeReview(reservation.id)">
            리뷰 작성
          </button>
        </div>
      </div>

      <div v-if="filteredReservations.length === 0" class="no-reservations">
        예약 내역이 없습니다.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const tabs = [
  { label: '예정된 예약', value: 'upcoming' },
  { label: '이용 완료', value: 'completed' },
  { label: '취소된 예약', value: 'cancelled' }
];

const currentTab = ref('upcoming');

const reservations = ref([
  {
    id: 1,
    name: '서울 시그니엘',
    image: 'https://example.com/hotel1.jpg',
    checkIn: '2024-03-01',
    checkOut: '2024-03-03',
    guests: 2,
    price: 350000,
    status: 'upcoming'
  },
  {
    id: 2,
    name: '제주 롯데호텔',
    image: 'https://example.com/hotel2.jpg',
    checkIn: '2024-02-15',
    checkOut: '2024-02-17',
    guests: 3,
    price: 280000,
    status: 'completed'
  },
  {
    id: 3,
    name: '부산 파크하얏트',
    image: 'https://example.com/hotel3.jpg',
    checkIn: '2024-01-20',
    checkOut: '2024-01-22',
    guests: 2,
    price: 250000,
    status: 'cancelled'
  }
]);

const filteredReservations = computed(() => {
  return reservations.value.filter(reservation => reservation.status === currentTab.value);
});

const getStatusText = (status) => {
  const statusMap = {
    upcoming: '예약 확정',
    completed: '이용 완료',
    cancelled: '취소됨'
  };
  return statusMap[status];
};

const cancelReservation = (id) => {
  if (confirm('예약을 취소하시겠습니까?')) {
    // TODO: API 연동
    const reservation = reservations.value.find(r => r.id === id);
    if (reservation) {
      reservation.status = 'cancelled';
    }
  }
};

const writeReview = (id) => {
  // TODO: 리뷰 작성 페이지로 이동
  alert('리뷰 작성 페이지로 이동합니다.');
};
</script>

<style scoped>
.reservations-container {
  max-width: 900px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.reservation-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: #495057;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #1a73e8;
  border-bottom-color: #1a73e8;
  font-weight: 500;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reservation-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.reservation-image {
  width: 200px;
  height: 150px;
  overflow: hidden;
  border-radius: 4px;
}

.reservation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reservation-info {
  flex: 1;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.accommodation-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.reservation-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.reservation-status.upcoming {
  background: #e8f0fe;
  color: #1a73e8;
}

.reservation-status.completed {
  background: #e6f8e6;
  color: #2b8a3e;
}

.reservation-status.cancelled {
  background: #fff5f5;
  color: #e03131;
}

.reservation-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
}

.detail-item i {
  width: 20px;
}

.reservation-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1a73e8;
  color: white;
}

.btn-danger {
  background: #e03131;
  color: white;
}

.no-reservations {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .reservation-item {
    flex-direction: column;
  }

  .reservation-image {
    width: 100%;
  }
}
</style> 