<template>
  <ModalDialog
    :show="showLoginModal"
    title="로그인 필요"
    message="예약 내역 조회는 로그인 후 이용 가능합니다."
    confirmText="확인"
    :onConfirm="goToLogin"
  />
  <ModalDialog
    :show="showErrorModal"
    title="오류"
    :message="errorMessage"
    :onConfirm="() => showErrorModal = false"
  />
  <ModalDialog
    :show="showSuccessModal"
    title="알림"
    :message="successMessage"
    :onConfirm="() => showSuccessModal = false"
  />
  <div class="reservations-container">
    <h2 class="page-title">예약 현황</h2>
    
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-button', { active: currentTab === tab.value }]"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      예약 목록을 불러오는 중...
    </div>
    
    <div v-else-if="filteredReservations.length === 0" class="no-reservations">
      {{ currentTab === 'PAID' ? '예정된 예약이 없습니다.' :
         currentTab === 'PENDING' ? '대기중인 예약이 없습니다.' :
         '취소된 예약이 없습니다.' }}
    </div>
    
    <div v-else class="reservation-list">
      <div 
        v-for="reservation in filteredReservations" 
        :key="reservation.reservationId" 
        :class="['reservation-card', reservation.reservationStatus.toLowerCase()]"
      >
        <div class="reservation-header">
          <h3>{{ reservation.productName }}</h3>
          <span :class="['status-badge', reservation.reservationStatus.toLowerCase()]">
            {{ getStatusText(reservation.reservationStatus) }}
          </span>
        </div>
        
        <div class="reservation-details">
          <div class="detail-row">
            <span class="label">📅 낚시 예정일:</span>
            <span class="value">{{ formatDate(reservation.fishingAt) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">🎣 상품 옵션:</span>
            <span class="value">{{ reservation.optionName }}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">👥 예약 인원:</span>
            <span class="value">{{ reservation.numPerson }}명</span>
          </div>
          
          <div class="detail-row">
            <span class="label">💳 결제 방법:</span>
            <span class="value">{{ reservation.paymentsMethod || '정보 없음' }}</span>
          </div>
          
          <div class="detail-row full-width">
            <span class="label">📝 예약 신청일:</span>
            <span class="value">{{ formatDateTime(reservation.createdAt) }}</span>
          </div>
        </div>
        
        <div class="reservation-actions" v-if="canCancel(reservation)">
          <button 
            class="cancel-button" 
            @click="handleCancelReservation(reservation.reservationId)"
            :disabled="cancelling"
          >
            {{ cancelling ? '취소 처리 중...' : '예약 취소' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { myPageAPI } from '@/api/mypage.js';
import { useRouter } from 'vue-router';
import ModalDialog from '@/components/common/ModalDialog.vue';

const tabs = [
  { label: '예정된 예약', value: 'PAID' },
  { label: '대기중', value: 'PENDING' },
  { label: '취소된 예약', value: 'CANCELED' }
];

const currentTab = ref('PAID');
const reservations = ref([]);
const loading = ref(false);
const cancelling = ref(false);
const showLoginModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');
const showSuccessModal = ref(false);
const successMessage = ref('');
const router = useRouter();

// 테스트용 임시 데이터
const testData = [
  {
    reservationId: 1,
    productName: "테스트 상품",
    optionName: "기본 옵션",
    userName: "테스트 사용자",
    fishingAt: "2024-03-01T10:00:00",
    numPerson: 2,
    reservationStatus: "RESERVED",
    paymentsMethod: "카드",
    createdAt: "2024-02-20T15:30:00"
  }
];

const filteredReservations = computed(() => {
  console.log('현재 전체 예약:', reservations.value);
  console.log('현재 선택된 탭:', currentTab.value);
  
  const filtered = reservations.value.filter(reservation => {
    console.log('예약 상태 확인:', reservation.reservationStatus);
    const status = reservation.reservationStatus || 'PAID';
    return status === currentTab.value;
  });
  
  console.log('필터링된 예약:', filtered);
  return filtered;
});

const loadReservations = async () => {
  loading.value = true;
  try {
    const data = await myPageAPI.getMyReservations();
    console.log('예약 데이터 날짜 정보:', data.map(item => ({
      id: item.reservationId,
      fishingAt: item.fishingAt,
      createdAt: item.createdAt,
      productName: item.productName
    })));
    reservations.value = data;
    // 로그인 정보가 없으면 모달 표시
    if (!Array.isArray(data) || data.length === 0) {
      // 추가적으로 사용자 정보 체크를 원하면 getMyInfo()로도 체크 가능
      const token = localStorage.getItem('token');
      if (!token) showLoginModal.value = true;
    }
  } catch (error) {
    console.error('예약 목록 로딩 실패:', error);
    if (error.response?.status === 401) {
      showLoginModal.value = true;
    } else {
      errorMessage.value = '예약 목록을 불러오는데 실패했습니다.';
      showErrorModal.value = true;
    }
    reservations.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error('잘못된 날짜 형식:', dateString);
    return dateString;
  }
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error('잘못된 날짜 형식:', dateString);
    return dateString;
  }
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusText = (status) => {
  const statusMap = {
    'PAID': '예약 확정',
    'PENDING': '대기중',
    'CANCELED': '취소됨'
  };
  return statusMap[status] || status;
};

const canCancel = (reservation) => {
  const status = reservation.reservationStatus;
  // PAID 상태이고 아직 이용하지 않은 예약만 취소 가능
  return status === 'PAID';
};

const handleCancelReservation = async (id) => {
  if (!confirm('예약을 취소하시겠습니까?')) return;
  
  cancelling.value = true;
  try {
    await myPageAPI.cancelReservation(id);
    successMessage.value = '예약이 성공적으로 취소되었습니다.';
    showSuccessModal.value = true;
    await loadReservations();
  } catch (error) {
    console.error('예약 취소 실패:', error);
    const errMsg = error.response?.data || '예약 취소 중 오류가 발생했습니다.';
    if (error.response?.status === 403) {
      errorMessage.value = '현재 상태에서는 예약을 취소할 수 없습니다.\n이미 취소되었거나, 이용이 완료된 예약입니다.';
    } else if (error.response?.status === 401) {
      errorMessage.value = '로그인이 필요합니다.';
    } else {
      errorMessage.value = errMsg;
    }
    showErrorModal.value = true;
  } finally {
    cancelling.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  loadReservations();
});
</script>

<style scoped>
.reservations-container {
  padding: 0;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #0d47a1;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
}

.tab-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #1565c0;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  text-align: center;
  border: 2px solid #90caf9;
}

.tab-button:hover {
  background: rgba(25, 118, 210, 0.1);
  transform: translateY(-2px);
}

.tab-button.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.reservation-list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.reservation-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  border: 2px solid #90caf9;
  transition: transform 0.3s ease;
}

.reservation-card:hover {
  transform: translateY(-5px);
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e3f2fd;
}

.reservation-header h3 {
  font-size: 1.2rem;
  color: #0d47a1;
  font-weight: 600;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.paid {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #81c784;
}

.status-badge.pending {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffb74d;
}

.status-badge.canceled {
  background: #fbe9e7;
  color: #d32f2f;
  border: 1px solid #ef5350;
}

.reservation-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.detail-row .label {
  color: #546e7a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-row .value {
  color: #1565c0;
  font-weight: 500;
}

.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.reservation-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #e3f2fd;
  display: flex;
  justify-content: flex-end;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #ef5350;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover:not(:disabled) {
  background: #d32f2f;
  transform: translateY(-2px);
}

.cancel-button:disabled {
  background: #ffcdd2;
  cursor: not-allowed;
}

.loading, .no-reservations {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  color: #546e7a;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  border: 2px solid #90caf9;
}

@media (max-width: 768px) {
  .reservations-container {
    padding: 1rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-button {
    width: 100%;
  }

  .reservation-list {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style> 