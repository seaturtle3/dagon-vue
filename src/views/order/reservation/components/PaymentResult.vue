<template>
  <div>
    <h2>결제 결과 확인 중...</h2>
    <ModalDialog
      :show="showSuccessModal"
      title="결제 성공"
      :message="successMessage"
      :onConfirm="goToReservations"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import ModalDialog from '@/components/common/ModalDialog.vue'

const showSuccessModal = ref(false)
const successMessage = ref('')
const router = useRouter()

const goToReservations = () => {
  showSuccessModal.value = false
  router.push('/mypage/reservations')
}

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
        successMessage.value = '결제가 완료되었습니다.';
        showSuccessModal.value = true;
      } else {
        successMessage.value = '검증 실패: ' + result.message;
        showSuccessModal.value = true;
      }
    } catch (err) {
      console.error("결제 검증 중 오류:", err);
      successMessage.value = '서버 오류 발생';
      showSuccessModal.value = true;
    }
  } else {
    successMessage.value = '결제 정보가 없습니다.';
    showSuccessModal.value = true;
  }
});
</script>
