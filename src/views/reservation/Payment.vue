<template>
  <div>
    <h1>결제 테스트</h1>
    <button @click="handleClick">결제하기</button>
  </div>
</template>

<script>
export default {
  name: "Payments",
  mounted() {
    if (!window.IMP) {
      const script = document.createElement("script");
      script.src = "https://cdn.iamport.kr/v1/iamport.js"; // ✅ 최신 SDK
      script.onload = () => {
        window.IMP.init("imp64386158"); // 본인 imp_uid 사용
      };
      document.head.appendChild(script);
    } else {
      window.IMP.init("imp64386158");
    }
  },
  methods: {
    handleClick() {

      const IMP = window.IMP;
      if (!IMP) {
        alert("결제 모듈이 아직 로드되지 않았습니다.");
        return;
      }

      IMP.request_pay(
          {
            pg: "html5_inicis.INIpayTest",
            pay_method: "card",
            merchant_uid: "ORD-" + new Date().getTime(),
            name: "테스트 상품",
            amount: 100,
            buyer_email: "test@test.com",
            buyer_name: "홍길동",
            buyer_tel: "010-0000-0000",
            buyer_addr: "서울시 강남구",
            buyer_postcode: "12345",

            // ✅ 리디렉션 URL 추가
            m_redirect_url: "http://localhost:5173/payments/result",
          },
          function (rsp) {
            // 이 콜백은 리디렉션 방식에선 호출되지 않음 (무시됨)
            console.log("콜백 응답 (리디렉션일 경우 호출되지 않음):", rsp);
          }
      );
    },
  },
};
</script>
