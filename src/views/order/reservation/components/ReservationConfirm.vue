<template>
  <div>
    <h2>예약 확인</h2>

    <p>출조일: {{ fishingAt }}</p>
    <p>인원 수: {{ numPerson }}명</p>
    <p>결제 금액: {{ amount }}원</p>

    <button @click="goBack">예약정보 수정</button>
    <button @click="requestPay">카카오페이/네이버페이/신용카드로 결제하기</button>
    <router-link to="/payments/account" class="btn">
      무통장 입금(계좌정보 확인)
    </router-link>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
  name: 'ReservationConfirm',
  setup() {
    const route = useRoute()
    const fishingAt = ref('')
    const numPerson = ref(0)
    const amount = ref(0)

    const goBack = () => {
      window.opener?.focus()
      window.close()
    }

    const requestPay = () => {
      const IMP = window.IMP
      if (!IMP) {
        alert('결제 모듈이 로드되지 않았습니다.')
        return
      }
      IMP.init('imp64386158')

      IMP.request_pay(
          {
            pg: 'html5_inicis.INIpayTest',
            pay_method: 'card',
            merchant_uid: 'ORD-' + new Date().getTime(),
            name: '출조 예약',
            amount: amount.value,
            buyer_email: 'test@test.com',
            buyer_name: '홍길동',
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
        const res = await axios.post(
            '/api/payment/verify',
            { imp_uid: impUid },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('authToken')
              }
            }
        )

        const data = res.data
        if (data.success === true || data.success === 'true') {
          alert('결제 완료!')
          window.close()
        } else {
          alert('결제 검증 실패: ' + data.message)
        }
      } catch (err) {
        console.error('결제 검증 오류:', err)
        alert('서버 오류가 발생했습니다.')
      }
    }

    onMounted(() => {
      fishingAt.value = route.query.fishingAt || ''
      numPerson.value = parseInt(route.query.numPerson) || 1
      amount.value = parseInt(route.query.amount) || 0
    })

    return {
      fishingAt,
      numPerson,
      amount,
      goBack,
      requestPay
    }
  }
}
</script>

<!-- IAMPORT 결제 스크립트 전역 포함 (index.html 혹은 main.js에서 추가 필요) -->
<script src="https://cdn.iamport.kr/js/iamport.payment-1.1.8.js"></script>

<style scoped>
.btn {
  display: inline-block;
  padding: 8px 16px;
  margin-top: 10px;
  background-color: #eee;
  text-decoration: none;
  border-radius: 4px;
}
button {
  margin-right: 10px;
  margin-top: 10px;
}
</style>