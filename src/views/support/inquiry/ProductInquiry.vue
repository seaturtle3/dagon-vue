<template>
  <div class="inquiry-main">
    <h2>파트너 1:1 문의</h2>
    <form @submit.prevent="submitInquiry">
      <div class="form-group">
        <label>상품명</label>
        <input v-model="form.productName" type="text" readonly />
      </div>
      <div class="form-group">
        <label>문의 유형</label>
        <select v-model="form.inquiryType" required>
          <option value="">문의 유형을 선택하세요.</option>
          <option value="PRODUCT">상품 문의</option>
          <option value="RESERVATION">예약 문의</option>
          <option value="CANCEL">예약 취소 문의</option>
        </select>
      </div>
      <div class="form-group">
        <label>제목</label>
        <input v-model="form.title" type="text" required />
      </div>
      <div class="form-group">
        <label>내용</label>
        <textarea v-model="form.content" rows="5" required></textarea>
      </div>
      <button type="submit" class="submit-btn">문의 등록</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { partnerService } from '@/api/partner';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const form = ref({
  productName: '',
  productId: null,
  partnerUno: null,
  inquiryType: '',
  title: '',
  content: '',
});

onMounted(() => {
  if (route.query.productName) form.value.productName = route.query.productName;
  if (route.query.productId) form.value.productId = Number(route.query.productId);
  if (route.query.partnerUno) form.value.partnerUno = Number(route.query.partnerUno);
});

async function submitInquiry() {
  if (!form.value.productName) {
    alert('상품 정보가 없습니다.');
    return;
  }
  if (!form.value.inquiryType) {
    alert('문의 유형을 선택하세요.');
    return;
  }
  try {
    await partnerService.createPartnerInquiry({
      productId: form.value.productId,
      partnerUno: form.value.partnerUno,
      title: `${form.value.productName} 문의 - ${form.value.title}`,
      content: form.value.content,
      inquiryType: form.value.inquiryType
    });
    alert('문의가 등록되었습니다.');
    form.value.title = '';
    form.value.content = '';
    form.value.inquiryType = '';
    router.push('/partner/inquiries');
  } catch (e) {
    alert('문의 등록에 실패했습니다.');
  }
}
</script>

<style scoped>
.inquiry-main {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem;
}
.form-group {
  margin-bottom: 1.2rem;
}
label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
input, textarea, select {
  width: 100%;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  padding: 10px;
  font-size: 1rem;
  margin-top: 0.2rem;
}
.submit-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-btn:hover {
  background: #1251a3;
}
</style> 