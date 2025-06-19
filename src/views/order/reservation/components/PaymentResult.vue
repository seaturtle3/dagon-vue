<template>
  <div class="payment-result-container">
    <div class="result-header">
      <h2>결제 결과</h2>
    </div>
    
    <div class="result-content">
      <div v-if="loading" class="loading">
        <p>결제 결과 확인 중...</p>
      </div>
      
      <div v-else-if="paymentSuccess" class="success-result">
        <div class="success-icon">✅</div>
        <h3>결제가 성공했습니다!</h3>
        <div class="reservation-details" v-if="reservationInfo">
          <p><strong>예약 날짜:</strong> {{ formatDate(reservationInfo.fishingAt) }}</p>
          <p><strong>총 인원:</strong> {{ reservationInfo.totalPeople }}명</p>
          <p><strong>결제 금액:</strong> {{ reservationInfo.estimatedPrice?.toLocaleString() }}원</p>
        </div>
        <p class="success-message">예약이 완료되었습니다. 마이페이지에서 예약 내역을 확인하실 수 있습니다.</p>
      </div>
      
      <div v-else class="error-result">
        <div class="error-icon">❌</div>
        <h3>결제에 실패했습니다</h3>
        <p class="error-message">{{ errorMessage }}</p>
      </div>
    </div>

    <div class="action-buttons">
      <button v-if="paymentSuccess" class="btn-primary" @click="goToReservations">
        예약 내역 보기
      </button>
      <button class="btn-secondary" @click="goToCalendar">
        캘린더로 돌아가기
      </button>
    </div>

    <ModalDialog
      :show="showSuccessModal"
      title="결제 성공"
      :message="successMessage"
      :onConfirm="goToReservations"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ModalDialog from '@/components/common/ModalDialog.vue'

const showSuccessModal = ref(false)
const successMessage = ref('')
const loading = ref(true)
const paymentSuccess = ref(false)
const errorMessage = ref('')
const reservationInfo = ref(null)
const router = useRouter()
const route = useRoute()

const formatDate = (dateString) => {
  if (!dateString) return '';
  // YYYY-MM-DD 형식의 문자열을 Date 객체로 변환
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month는 0부터 시작하므로 -1
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

const goToReservations = () => {
  showSuccessModal.value = false
  router.push('/mypage/reservations')
}

const goToCalendar = () => {
  router.push('/reservation-calendar')
}

onMounted(async () => {
  // URL 쿼리 파라미터에서 결제 성공 여부 확인
  const success = route.query.success === 'true'
  
  if (success) {
    // 예약 캘린더에서 온 성공 케이스
    paymentSuccess.value = true
    reservationInfo.value = {
      fishingAt: route.query.fishingAt,
      adultCount: parseInt(route.query.adultCount) || 0,
      childCount: parseInt(route.query.childCount) || 0,
      totalPeople: parseInt(route.query.totalPeople) || 0,
      estimatedPrice: parseInt(route.query.estimatedPrice) || 0
    }
    loading.value = false
  } else {
    // 아임포트 결제 검증 (기존 로직)
    const url = new URL(window.location.href)
    const imp_uid = url.searchParams.get('imp_uid')
    const merchant_uid = url.searchParams.get('merchant_uid')

    if (imp_uid && merchant_uid) {
      try {
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("authToken"),
          },
          body: JSON.stringify({ imp_uid, merchant_uid }),
        });

        const result = await response.json();
        if (result.success === true) {
          paymentSuccess.value = true
          successMessage.value = '결제가 완료되었습니다.';
          showSuccessModal.value = true;
        } else {
          paymentSuccess.value = false
          errorMessage.value = '검증 실패: ' + result.message;
        }
      } catch (err) {
        console.error("결제 검증 중 오류:", err);
        paymentSuccess.value = false
        errorMessage.value = '서버 오류 발생';
      }
    } else {
      paymentSuccess.value = false
      errorMessage.value = '결제 정보가 없습니다.';
    }
    loading.value = false
  }
});
</script>

<style scoped>
.payment-result-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.result-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.result-header h2 {
  color: #333;
  margin: 0;
}

.result-content {
  text-align: center;
  margin-bottom: 2rem;
}

.loading {
  padding: 2rem;
}

.loading p {
  color: #666;
  font-size: 1.1rem;
}

.success-result, .error-result {
  padding: 2rem;
}

.success-icon, .error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-result h3 {
  color: #28a745;
  margin-bottom: 1rem;
}

.error-result h3 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.reservation-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: left;
}

.reservation-details p {
  margin: 0.5rem 0;
  color: #333;
}

.success-message {
  color: #28a745;
  font-weight: 500;
  margin-top: 1rem;
}

.error-message {
  color: #dc3545;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-primary {
  background: #007BFF;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108,117,125,0.3);
}
</style>
