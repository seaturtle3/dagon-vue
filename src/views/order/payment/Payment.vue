<template>
  <div class="payment-container">
    <div class="payment-header">
      <h1>예약 결제</h1>
    </div>

    <div class="reservation-summary" v-if="reservationInfo">
      <h3>예약 정보</h3>
      <div class="summary-item">
        <span class="label">예약 날짜:</span>
        <span class="value">{{ formatDate(reservationInfo.fishingAt) }}</span>
      </div>

      <div class="summary-item">
        <span class="label">이용 금액:</span>
        <span class="value">{{ reservationInfo.totalPeople }}원</span>
      </div>

      <div class="summary-item">
        <span class="label">인원수:</span>
        <span class="value">{{ reservationInfo.Count }}명</span>
      </div>

<!--      <div class="summary-item">-->
<!--        <label for="nickname">닉네임:</label>-->
<!--        <input type="text" id="nickname" :value="userInfo.nickname" disabled />-->
<!--      </div>-->

<!--      <div class="summary-item">-->
<!--        <label for="phone">연락처:</label>-->
<!--        <input type="tel" id="phone" :value="userInfo.phone" disabled />-->
<!--      </div>-->

<!--      <div class="summary-item">-->
<!--        <label for="email">이메일:</label>-->
<!--        <input type="email" id="email" :value="userInfo.email" disabled />-->
<!--      </div>-->

      <div class="summary-item total-price">
        <span class="label">결제 금액:</span>
        <span class="value">{{ reservationInfo.estimatedPrice?.toLocaleString() }}원</span>
      </div>
    </div>

    <!-- 예약자 정보 입력란 -->
    <div class="user-info-form">
      <div class="form-row">
        <label for="buyerName">예약자명</label>
        <input id="buyerName" v-model="userInfo.buyer_name" type="text" placeholder="예약자명을 입력하세요" required />
      </div>
      <div class="form-row">
        <label for="buyerEmail">이메일</label>
        <input id="buyerEmail" v-model="userInfo.buyer_email" type="email" placeholder="이메일을 입력하세요" required />
      </div>
      <div class="form-row">
        <label for="buyerTel">연락처</label>
        <input id="buyerTel" v-model="userInfo.buyer_tel" type="tel" placeholder="연락처를 입력하세요" required />
      </div>
    </div>

    <div class="payment-actions">
      <button class="btn-payment" @click="handlePayment" :disabled="!reservationInfo || !isUserInfoValid">
        결제하기
      </button>
      <button class="btn-cancel" @click="goBack">
        취소
      </button>
    </div>
  </div>
</template>

<script>
import {BASE_URL} from "@/constants/baseUrl.js";

export default {
  name: "Payments",
  data() {
    return {
      reservationInfo: null,
      userInfo: {
        buyer_name: '',
        buyer_email: '',
        buyer_tel: ''
      }
    }
  },
  computed: {
    isUserInfoValid() {
      // 모든 필드가 비어있지 않은지 체크
      return this.userInfo.buyer_name && this.userInfo.buyer_email && this.userInfo.buyer_tel;
    }
  },
  mounted() {
    // URL 쿼리 파라미터에서 예약 정보 가져오기
    this.reservationInfo = {
      fishingAt: this.$route.query.fishingAt,
      adultCount: parseInt(this.$route.query.adultCount) || 0,
      childCount: parseInt(this.$route.query.childCount) || 0,
      totalPeople: parseInt(this.$route.query.totalPeople) || 0,
      estimatedPrice: parseInt(this.$route.query.estimatedPrice) || 0
    };

    // 예약 정보가 없으면 이전 페이지로 이동
    if (!this.reservationInfo.fishingAt) {
      alert("예약 정보가 없습니다.");
      this.$router.push('/reservation-calendar');
      return;
    }

    if (!window.IMP) {
      const script = document.createElement("script");
      script.src = "https://cdn.iamport.kr/v1/iamport.js";
      script.onload = () => {
        window.IMP.init("imp64386158");
      };
      document.head.appendChild(script);
    } else {
      window.IMP.init("imp64386158");
    }
  },
  methods: {
    formatDate(dateString) {
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
    },

    handlePayment() {
      const IMP = window.IMP;
      if (!IMP) {
        alert("결제 모듈이 아직 로드되지 않았습니다.");
        return;
      }

      if (!this.reservationInfo) {
        alert("예약 정보가 없습니다.");
        return;
      }
      if (!this.isUserInfoValid) {
        alert("예약자명, 이메일, 연락처를 모두 입력해주세요.");
        return;
      }

      IMP.request_pay(
          {
            pg: "html5_inicis.INIpayTest",
            pay_method: "card",
            merchant_uid: "RESV-" + new Date().getTime(),
            name: `낚시 예약 (${this.formatDate(this.reservationInfo.fishingAt)})`,
            amount: this.reservationInfo.estimatedPrice,
            buyer_email: this.userInfo.buyer_email,
            buyer_name: this.userInfo.buyer_name,
            buyer_tel: this.userInfo.buyer_tel,
            buyer_addr: "서울시 강남구",
            buyer_postcode: "12345",
            m_redirect_url: `${BASE_URL}/payments/result`,
          },
          (rsp) => {
            if (rsp.success) {
              // 결제 성공 시 처리
              this.handlePaymentSuccess(rsp);
            } else {
              // 결제 실패 시 처리
              this.handlePaymentFailure(rsp);
            }
          }
      );
    },

    handlePaymentSuccess(rsp) {
      console.log("결제 성공:", rsp);
      alert("결제가 성공했습니다!");

      // 결제 성공 후 예약 정보를 서버에 저장하는 로직 추가
      this.saveReservation(rsp);
    },

    handlePaymentFailure(rsp) {
      console.log("결제 실패:", rsp);
      alert(`결제에 실패했습니다: ${rsp.error_msg}`);
    },

    async saveReservation(paymentResult) {
      try {
        // 실제로는 서버에 예약 정보와 결제 정보를 함께 저장
        const reservationData = {
          ...this.reservationInfo,
          paymentId: paymentResult.imp_uid,
          paymentMethod: paymentResult.pay_method,
          paymentAmount: paymentResult.paid_amount,
          paymentStatus: 'paid'
        };

        // API 호출 예시 (실제 구현 필요)
        // const response = await fetch('/api/reservations', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(reservationData)
        // });

        console.log("예약 정보 저장:", reservationData);

        // 예약 완료 페이지로 이동
        this.$router.push({
          name: 'PaymentResult',
          query: {
            success: 'true',
            reservationId: 'temp-id' // 실제로는 서버에서 받은 예약 ID
          }
        });
      } catch (error) {
        console.error("예약 저장 실패:", error);
        alert("예약 정보 저장에 실패했습니다.");
      }
    },

    goBack() {
      this.$router.push('/reservation-calendar');
    }
  },
};
</script>

<style scoped>
.payment-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.payment-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.payment-header h1 {
  color: #333;
  margin: 0;
}

.reservation-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.reservation-summary h3 {
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total-price {
  border-top: 2px solid #007BFF;
  border-bottom: none;
  margin-top: 1rem;
  padding-top: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.label {
  font-weight: 600;
  color: #555;
}

.value {
  color: #333;
  font-weight: 500;
}

.total-price .value {
  color: #007BFF;
  font-size: 1.2rem;
}

.payment-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-payment, .btn-cancel {
  padding: 12px 30px;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-payment {
  background: #007BFF;
  color: white;
}

.btn-payment:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.btn-payment:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108,117,125,0.3);
}

.user-info-form {
  background: #f4f8fb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.form-row label {
  min-width: 80px;
  font-weight: 600;
  color: #333;
}
.form-row input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
.form-row input:focus {
  border-color: #007bff;
  outline: none;
}
</style>
