<script setup>
import InquiryList from '@/views/inquiries/components/InquiryList.vue'
import InquiryForm from '@/views/inquiries/components/InquiryForm.vue'

import { useInquiryStore } from '@/store/inquiries/inquiryStore.js'

import { onMounted } from 'vue'

// 스토어 가져오기
const inquiryStore = useInquiryStore()

function onFormSubmit() {
  inquiryStore.toggleForm()
  // 등록 후 리스트 새로고침
  inquiryStore.fetchInquiries()
}

onMounted(() => {
  inquiryStore.fetchInquiries()

})
</script>

<template>

  <div>
    <h2>1:1 문의</h2>
    <hr />

    <!-- InquiryList -->
    <InquiryList
        v-if="!inquiryStore.showForm"
        :inquiries="inquiryStore.inquiries"
        @edit="inquiryStore.editInquiry"
    />

    <!-- InquiryForm -->
    <InquiryForm
        v-if="inquiryStore.showForm"
        :form="inquiryStore.form"
        :writer-types="inquiryStore.writerTypes"
        :inquiry-types="inquiryStore.inquiryTypes"
        @submit="onFormSubmit"
    />

    <!-- 토글 버튼 -->
    <div class="bottom-buttons">
      <button @click="inquiryStore.toggleForm">
        {{ inquiryStore.showForm ? '뒤로가기' : '문의하기' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.bottom-buttons {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}
.bottom-buttons button {
  padding: 12px 24px;
  color: black;
  border: none;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  background-color: #f0f0f0;
}
.bottom-buttons button:hover {
  background-color: #007BFF;
  color: white;
}
</style>
