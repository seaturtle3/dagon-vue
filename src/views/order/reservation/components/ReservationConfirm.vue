<template>
  <!-- 예약 확인 성공 시 모달 -->
  <ModalDialog
    :show="showSuccessModal"
    title="예약 완료"
    :message="successMessage"
    :onConfirm="goToReservations"
  />
  <!--  <div class="reservation-confirm">-->
  <!--    <h2>예약 정보 확인</h2>-->

  <!--    <div class="confirm-content">-->
  <!--      <div class="info-section">-->
  <!--        <h3>예약 정보</h3>-->
  <!--        <div class="info-item">-->
  <!--          <span class="label">출조일:</span>-->
  <!--          <span class="value">{{ formatDateTime(fishingAt) }}</span>-->
  <!--        </div>-->
  <!--        <div class="info-item">-->
  <!--          <span class="label">인원 수:</span>-->
  <!--          <span class="value">{{ numPerson }}명</span>-->
  <!--        </div>-->
  <!--        <div class="info-item">-->
  <!--          <span class="label">결제 금액:</span>-->
  <!--          <span class="value">{{ amount.toLocaleString() }}원</span>-->
  <!--        </div>-->
  <!--      </div>-->

  <!--      <div class="info-section">-->
  <!--        <h3>예약자 정보</h3>-->
  <!--        <div class="info-item">-->
  <!--          <span class="label">닉네임:</span>-->
  <!--          <span class="value">{{ userName }}</span>-->
  <!--        </div>-->
  <!--        <div class="info-item">-->
  <!--          <span class="label">연락처:</span>-->
  <!--          <span class="value">{{ userPhone }}</span>-->
  <!--        </div>-->
  <!--        <div class="info-item">-->
  <!--          <span class="label">이메일:</span>-->
  <!--          <span class="value">{{ userEmail }}</span>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    </div>-->

  <!--    <div class="button-group">-->
  <!--      <button @click="closePopup" class="btn btn-primary">확인</button>-->
  <!--    </div>-->
  <!--  </div>-->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModalDialog from '@/components/common/ModalDialog.vue'

const route = useRoute()
const router = useRouter()
const fishingAt = ref('')
const numPerson = ref(0)
const amount = ref(0)
const userName = ref('')
const userPhone = ref('')
const userEmail = ref('')
const showSuccessModal = ref(false)
const successMessage = ref('예약이 완료되었습니다.')

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

const closePopup = () => {
  window.close()
}

const goToReservations = () => {
  showSuccessModal.value = false
  router.push('/mypage/reservations')
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  fishingAt.value = params.get('fishingAt')
  numPerson.value = parseInt(params.get('numPerson'))
  amount.value = parseInt(params.get('amount'))
  userName.value = params.get('userName')
  userPhone.value = params.get('userPhone')
  userEmail.value = params.get('userEmail')
})
</script>

<style scoped>
.reservation-confirm {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #2c3e70;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.confirm-content {
  margin-bottom: 30px;
}

.info-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-section h3 {
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

.info-item:last-child {
  margin-bottom: 0;
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
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.btn {
  padding: 12px 30px;
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
  box-shadow: 0 4px 12px rgba(44, 62, 112, 0.2);
}
</style>