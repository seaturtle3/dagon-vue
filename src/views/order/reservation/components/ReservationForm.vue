<template>
  <div>
    <h1>예약 등록</h1>
    <p>예약할 배: {{ product.prodName }}</p>

    <form @submit.prevent="onSubmit">
      <label for="fishingAt">출조일</label>
      <input
          type="datetime-local"
          id="fishingAt"
          v-model="fishingAt"
      />

      <label for="numPerson">인원 수:</label>
      <input
          type="number"
          id="numPerson"
          v-model.number="numPerson"
          min="1"
          max="20"
          step="1"
      />

      <label for="uid">예약자:</label>
      <input type="text" id="uid" :value="user.displayName" disabled />

      <label for="totalAmount">결제 금액:</label>
      <span id="totalAmount">{{ totalAmount }}</span> 원
    </form>

    <br />
    <button @click="openReservationPopup">예약 확인</button>
    <button @click="requestPay">결제하기</button>
  </div>
</template>

<script>
import { onMounted, reactive, ref, computed } from 'vue'
import axios from 'axios'

export default {
  name: 'ReservationForm',
  setup() {
    const product = reactive({ prodName: '테스트 배' }) // 서버에서 받아오는 구조라면 props나 API 연동 필요
    const fishingAt = ref('')
    const numPerson = ref(1)
    const user = reactive({ displayName: '' })
    const pricePerPerson = 1000

    const totalAmount = computed(() => numPerson.value * pricePerPerson)

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/users/me', {
          headers: getAuthHeaders()
        })
        user.displayName = response.data.displayName
      } catch (error) {
        console.error('사용자 정보 요청 실패:', error)
      }
    }

    const openReservationPopup = () => {
      const query = new URLSearchParams({
        fishingAt: fishingAt.value,
        numPerson: numPerson.value,
        amount: totalAmount.value
      }).toString()
      window.open(`/reservation/confirm?${query}`, '예약확인', 'width=1200,height=800')
    }

    const requestPay = () => {
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
            merchant_uid: 'ORD-' + new Date().getTime(),
            name: '테스트 상품',
            amount: totalAmount.value,
            buyer_email: 'test@test.com',
            buyer_name: user.displayName || '홍길동',
            buyer_tel: '010-0000-0000',
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
        const response = await axios.post(
            '/api/payment/verify',
            { imp_uid: impUid },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('authToken')
              }
            }
        )
        if (response.data.success === 'true') {
          alert('결제 성공 및 검증 완료')
        } else {
          alert('결제 검증 실패: ' + response.data.message)
        }
      } catch (error) {
        console.error('서버 통신 오류:', error)
        alert('서버 오류가 발생했습니다.')
      }
    }

    const getAuthHeaders = () => {
      return {
        Authorization: 'Bearer ' + localStorage.getItem('authToken')
      }
    }

    const onSubmit = () => {
      // 필요시 예약 등록 로직 처리
      console.log('폼 제출')
    }

    onMounted(() => {
      fetchUserInfo()
    })

    return {
      product,
      fishingAt,
      numPerson,
      user,
      totalAmount,
      openReservationPopup,
      requestPay,
      onSubmit
    }
  }
}
</script>

<!-- IAMPORT 스크립트 포함 -->
<script src="https://cdn.iamport.kr/js/iamport.payment-1.1.8.js"></script>

<style scoped>
label {
  display: block;
  margin-top: 10px;
}
input {
  margin-bottom: 10px;
}
button {
  margin-right: 10px;
}
</style>