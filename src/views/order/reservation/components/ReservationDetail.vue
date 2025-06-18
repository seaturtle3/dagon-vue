<template>
  <ModalDialog
    :show="showSuccessModal"
    title="결제 성공"
    :message="successMessage"
    :onConfirm="goToReservations"
  />
  <div class="reservation-detail">
    <h1>예약 상세 정보</h1>
    <div class="detail-content">
      <div class="info-section">
        <h2>예약 정보</h2>
        <div class="info-item">
          <span class="label">예약 번호:</span>
          <span class="value">{{ reservation.reservationId }}</span>
        </div>
        <div class="info-item">
          <span class="label">출조일:</span>
          <span class="value">{{ formatDateTime(reservation.fishingAt) }}</span>
        </div>
        <div class="info-item">
          <span class="label">인원 수:</span>
          <span class="value">{{ reservation.numPerson }}명</span>
        </div>
        <div class="info-item">
          <span class="label">결제 금액:</span>
          <span class="value">{{ reservation.amount.toLocaleString() }}원</span>
        </div>
      </div>

      <div class="info-section">
        <h2>예약자 정보</h2>
        <div class="info-item">
          <span class="label">닉네임:</span>
          <span class="value">{{ reservation.userName }}</span>
        </div>
        <div class="info-item">
          <span class="label">연락처:</span>
          <span class="value">{{ reservation.userPhone }}</span>
        </div>
        <div class="info-item">
          <span class="label">이메일:</span>
          <span class="value">{{ reservation.userEmail }}</span>
        </div>
      </div>

      <div class="button-group">
        <button @click="onPaymentSuccess" class="btn btn-primary">결제하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reservationAPI } from '@/api/reservation.js'
import ModalDialog from '@/components/common/ModalDialog.vue'

const route = useRoute()
const router = useRouter()
const reservation = ref(null)
const loading = ref(true)
const error = ref(null)
const showSuccessModal = ref(false)
const successMessage = ref('결제가 완료되었습니다.')

const fetchReservationDetail = async () => {
  try {
    const response = await reservationAPI.getReservationDetail(route.params.id)
    reservation.value = response.data
  } catch (err) {
    error.value = '예약 정보를 불러오는데 실패했습니다.'
    console.error('예약 상세 정보 요청 실패:', err)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goToReservationForm = () => {
  router.push({
    name: 'ReservationForm',
    params: { id: route.params.id },
    state: { product: reservation.value.product }
  })
}

const goToReservations = () => {
  showSuccessModal.value = false
  router.push('/mypage/reservations')
}

const onPaymentSuccess = () => {
  showSuccessModal.value = true
}

onMounted(() => {
  fetchReservationDetail()
})
</script>

<style scoped>
.reservation-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.detail-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-section {
  margin-bottom: 30px;
}

.info-section h2 {
  color: #2c3e70;
  margin-bottom: 15px;
  font-size: 1.2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #2c3e70;
  font-weight: 600;
}

.button-group {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2c3e70;
  color: white;
}

.btn-primary:hover {
  background-color: #1a237e;
  transform: translateY(-2px);
}
</style> 