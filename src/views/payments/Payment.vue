<template>
  <div>
    <h1>결제 테스트</h1>
    <button @click="requestPay">결제하기</button>
  </div>
</template>

<script>
export default {
  name: "Payments",
  mounted() {
    // 결제 모듈 초기화
    if (window.IMP) {
      window.IMP.init("imp64386158");
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.iamport.kr/js/iamport.payment-1.1.8.js";
      script.onload = () => window.IMP.init("imp64386158");
      document.head.appendChild(script);
    }
  },
  methods: {
    requestPay() {
      const IMP = window.IMP;
      IMP.request_pay(
          {
            pg: "html5_inicis.INIpayTest",
            pay_method: "kakaopay",
            merchant_uid: "ORD-" + new Date().getTime(),
            name: "테스트 상품",
            amount: 100,
            buyer_email: "test@test.com",
            buyer_name: "홍길동",
            buyer_tel: "010-0000-0000",
            buyer_addr: "서울시 강남구",
            buyer_postcode: "12345",
          },
          (rsp) => {
            if (rsp.success) {
              // 결제 검증
              const requestData = {
                imp_uid: rsp.imp_uid,
                merchant_uid: rsp.merchant_uid,
              };

              fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + localStorage.getItem("authToken"),
                },
                body: JSON.stringify(requestData),
              })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.success === "true" || data.success === true) {
                      alert("결제 성공 및 검증 완료");
                    } else {
                      alert("결제 검증 실패: " + data.message);
                    }
                  })
                  .catch((err) => {
                    console.error("서버 통신 오류:", err);
                    alert("서버 오류가 발생했습니다.");
                  });
            } else {
              alert("결제 실패: " + rsp.error_msg);
            }
          }
      );
    },
  },
};
</script>