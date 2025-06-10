<template>
  <div>
    <h2>결제 결과 확인 중...</h2>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
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
        alert("결제 및 검증 성공");
      } else {
        alert("검증 실패: " + result.message);
      }
    } catch (err) {
      console.error("결제 검증 중 오류:", err);
      alert("서버 오류 발생");
    }
  } else {
    alert("결제 정보가 없습니다.");
  }
});
</script>
