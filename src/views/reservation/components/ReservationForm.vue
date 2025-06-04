<template>
  <div>
    <h1>예약 등록</h1>
    <p>예약할 배: {{ product.prodName }}</p>

    <form @submit.prevent="openReservationPopup">
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
    <button type="button" @click="openReservationPopup">예약 확인</button>
    <button type="button" @click="requestPay">결제하기</button>
  </div>
</template>

<script>
export default {
  name: 'ReservationForm',
  data() {
    return {
      fishingAt: '',
      numPerson: 1,
      user: {
        displayName: ''
      },
      product: {
        prodName: '테스트 선박'
      },
      pricePerPerson: 1000
    };
  },
  computed: {
    totalAmount() {
      return this.numPerson * this.pricePerPerson;
    }
  },
  mounted() {
    this.fetchUserInfo();

    // 아임포트 초기화
    if (window.IMP) {
      window.IMP.init("imp64386158");
    }
  },
  methods: {
    fetchUserInfo() {
      fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        }
      })
          .then(res => {
            if (!res.ok) throw new Error("사용자 정보 요청 실패");
            return res.json();
          })
          .then(data => {
            this.user.displayName = data.displayName;
          })
          .catch(err => console.error("에러:", err));
    },
    openReservationPopup() {
      const query = new URLSearchParams({
        fishingAt: this.fishingAt,
        numPerson: this.numPerson,
        amount: this.totalAmount
      }).toString();

      window.open(`/reservation/confirm?${query}`, '예약확인', 'width=1200,height=800');
    },
    requestPay() {
      const { IMP } = window;
      IMP.request_pay({
        pg: "html5_inicis.INIpayTest",
        pay_method: "card",
        merchant_uid: "ORD-" + new Date().getTime(),
        name: "테스트 상품",
        amount: this.totalAmount,
        buyer_email: "test@test.com",
        buyer_name: this.user.displayName,
        buyer_tel: "010-0000-0000",
        buyer_addr: "서울시 강남구",
        buyer_postcode: "12345"
      }, (rsp) => {
        if (rsp.success) {
          this.verifyPayment(rsp.imp_uid);
        } else {
          alert("결제 실패: " + rsp.error_msg);
        }
      });
    },
    verifyPayment(impUid) {
      fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("authToken")
        },
        body: JSON.stringify({ imp_uid: impUid })
      })
          .then(res => res.json())
          .then(data => {
            if (data.success === "true") {
              alert("결제 성공 및 검증 완료");
            } else {
              alert("결제 검증 실패: " + data.message);
            }
          })
          .catch(err => {
            console.error("서버 통신 오류:", err);
            alert("서버 오류가 발생했습니다.");
          });
    }
  }
};
</script>