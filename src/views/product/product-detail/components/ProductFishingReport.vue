<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductFishingReportStore } from '@/store/product/product-detail/useProductFishingReportStore.js'

const route = useRoute()
const store = useProductFishingReportStore()

onMounted(() => {
  const prodId = Number(route.params.prodId)
  store.fetchFishingReport(prodId)
  console.log('상세페이지 조황정보 productId:', prodId)
})
</script>

<template>
  <div v-if="store.loading">로딩중...</div>
  <div v-else-if="store.error">{{ store.error }}</div>
  <div v-else>
    <div v-if="store.report.length > 0">
      <div v-for="report in store.report" :key="report.frId" class="mb-4">
        <h3>제목: {{ report.title }}</h3>
        <p>내용: {{ report.content }}</p>
        <p>날짜: {{ report.fishingAt || '날짜 없음' }}</p>
        <p>상품명: {{ report.product?.prodName }}</p>
        <p>작성자: {{ report.user?.uname }}</p>
        <hr>
      </div>
    </div>
<!--    <div v-else>조황정보가 없습니다.</div>-->
  </div>
</template>