<template>
  <div class="reservation-form">
    <h1>예약 등록</h1>
    <p>예약할 배: {{ product.prodName }}</p>

    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="fishingAt">출조일</label>
        <input
            type="datetime-local"
            id="fishingAt"
            v-model="fishingAt"
            required
        />
      </div>

      <div class="form-group">
        <label for="numPerson">인원 수:</label>
        <input
            type="number"
            id="numPerson"
            v-model.number="numPerson"
            :min="product.minPerson"
            :max="product.maxPerson"
            step="1"
            required
        />
      </div>

<!--      <div class="form-group">-->
<!--        <label for="uid">예약자 ID:</label>-->
<!--        <input type="text" id="uid" :value="userInfo.uid" disabled />-->
<!--      </div>-->

      <div class="form-group">
        <label for="nickname">닉네임:</label>
        <input type="text" id="nickname" :value="userInfo.nickname" disabled />
      </div>

      <div class="form-group">
        <label for="phone">연락처:</label>
        <input type="tel" id="phone" :value="userInfo.phone" disabled />
      </div>

      <div class="form-group">
        <label for="email">이메일:</label>
        <input type="email" id="email" :value="userInfo.email" disabled />
      </div>

      <div class="form-group">
        <label for="totalAmount">결제 금액:</label>
        <div class="amount-display">
          <span id="totalAmount">{{ totalAmount.toLocaleString() }}</span>
          <span class="currency">원</span>
        </div>
      </div>

      <div class="button-group">
        <button type="button" @click="openReservationModal" class="btn btn-secondary">예약 확인</button>
      </div>
    </form>

    <!-- 예약 확인 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>예약 정보 확인</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="info-section">
            <h3>예약 정보</h3>
            <div class="info-item">
              <span class="label">출조일:</span>
              <span class="value">{{ formatDateTime(fishingAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">인원 수:</span>
              <span class="value">{{ numPerson }}명</span>
            </div>
            <div class="info-item">
              <span class="label">결제 금액:</span>
              <span class="value">{{ totalAmount.toLocaleString() }}원</span>
            </div>
          </div>

          <div class="info-section">
            <h3>예약자 정보</h3>
            <div class="info-item">
              <span class="label">닉네임:</span>
              <span class="value">{{ userInfo.nickname }}</span>
            </div>
            <div class="info-item">
              <span class="label">연락처:</span>
              <span class="value">{{ userInfo.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">이메일:</span>
              <span class="value">{{ userInfo.email }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="requestPay" class="btn btn-primary">결제하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { myPageAPI } from '@/api/mypage.js'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const fishingAt = ref('')
const numPerson = ref(1)
const showModal = ref(false)
const userInfo = ref({
  uid: '',
  nickname: '',
  phone: '',
  email: ''
})

const merchant_uid = 'ORD-' + new Date().getTime()

const totalAmount = computed(() => {
  const pricePerPerson = 1000 // 인당 1,000원
  return pricePerPerson * numPerson.value
})

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

const fetchUserInfo = async () => {
  try {
    const response = await myPageAPI.getMyInfo()
    userInfo.value = {
      uid: response.data.uid,
      nickname: response.data.nickname || response.data.uid,
      phone: response.data.phone,
      email: response.data.email
    }
  } catch (error) {
    console.error('사용자 정보 요청 실패:', error)
    alert('사용자 정보를 불러오는데 실패했습니다.')
  }
}

const openReservationModal = () => {
  if (!fishingAt.value) {
    alert('출조일을 선택해주세요.')
    return
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const requestPay = () => {
  if (!fishingAt.value) {
    alert('출조일을 선택해주세요.')
    return
  }

  if (!window.IMP) {
    alert('결제 모듈이 로드되지 않았습니다.')
    return
  }

  const IMP = window.IMP
  IMP.init('imp64386158')


  IMP.request_pay(
      {
        pg: 'html5_inicis.INIpayTest',
        pay_method: 'card',
        merchant_uid: merchant_uid,
        name: props.product.prodName,
        amount: totalAmount.value,
        buyer_email: userInfo.value.email,
        buyer_name: userInfo.value.nickname,
        buyer_tel: userInfo.value.phone,
        buyer_addr: '서울시 강남구',
        buyer_postcode: '12345'
      },
      (rsp) => {
        if (rsp.success) {
          verifyPayment(rsp.imp_uid)
        } else {
          alert('결제 실패: ' + rsp.error_msg)
        }
      }
  )
}

const verifyPayment = async (impUid) => {
  try {
    const response = await myPageAPI.verifyPayment({
      impUid: impUid, // impUid (camelCase)
      merchantUid: merchant_uid, // merchantUid (camelCase)
      amount: totalAmount.value, // amount
      buyerName: userInfo.value.nickname, // buyerName (camelCase)
      status: "PAID", // 예시: 결제 상태
      payMethod: "card", // payMethod (camelCase)
      paidAt: new Date().toISOString() // paidAt (ISO string, 서버에서 LocalDateTime으로 변환)
    })

    console.log("222222222->", response)

    if (response.status === 200) {
      alert('결제가 완료되었습니다.')
      await router.push('/mypage/reservations')
    } else {
      alert('결제 검증 실패: ' + response.data.message)
    }
  } catch (error) {
    if (error.response) {
      // 서버가 400, 500 등 에러를 반환한 경우
      alert('결제 실패: 서버 오류(' + error.response.status + ')');
    } else if (error.request) {
      // 서버로부터 응답이 없는 경우
      alert('서버로부터 응답이 없습니다.');
    } else {
      // 기타 네트워크 오류 등
      alert('요청 중 오류 발생: ' + error.message);
    }
  }
}

const onSubmit = () => {
  // 예약 등록 로직 구현 필요
  console.log('폼 제출')
}

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct && newProduct.minPerson) {
      numPerson.value = newProduct.minPerson
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.reservation-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #2c3e70;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e70;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 30px;
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

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
  transform: translateY(-2px);
}

.amount-display {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e70;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

#totalAmount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e70;
}

.currency {
  color: #666;
  font-size: 1rem;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e70;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 20px;
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

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}
</style>