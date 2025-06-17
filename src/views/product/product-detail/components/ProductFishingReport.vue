<script setup>
import {computed, onMounted} from 'vue'
import {useRoute} from 'vue-router'
import {useProductFishingReportStore} from '@/store/product/product-detail/useProductFishingReportStore.js'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const route = useRoute()
const store = useProductFishingReportStore()

onMounted(() => {
  const prodId = Number(route.params.prodId)
  store.fetchFishingReport(prodId)
  console.log('상세페이지 조황정보 productId:', prodId)
})

const reportCount = computed(() => store.report?.length || 0)
</script>

<template>
  <div v-if="store.loading">로딩중...</div>
  <div v-else-if="store.error">{{ store.error }}</div>
  <div v-else>

    <h2 class="mb-3 font-bold text-lg">
      조황정보 <span class="count">({{ reportCount }})</span>
    </h2>

    <div v-if="store.report.length > 0" class="report-grid">
      <div
          v-for="(report, index) in store.report.slice(0, 15)"
          :key="report.frId"
          class="report-box"
      >
        <img
            class="thumbnail"
            :src="`${IMAGE_BASE_URL}/fishing-report/${report.thumbnailUrl}`"
        />
        <h3>제목: {{ report.title }}</h3>
        <p>날짜: {{ report.fishingAt ? report.fishingAt.slice(0, 10) : '날짜 없음' }}</p>
        <p>상품명: {{ report.product?.prodName }}</p>
        <p>작성자: {{ report.user?.uname }}</p>
      </div>
    </div>
    <!-- <div v-else>조황정보가 없습니다.</div> -->
  </div>
</template>

<style scoped>
.report-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3열 */
  grid-auto-rows: minmax(150px, auto); /* 각 행 최소 높이 150px */
  gap: 16px; /* 박스 간 간격 */
  max-height: calc(150px * 5 + 16px * 4); /* 5행 높이 + 간격 */
  overflow-y: auto; /* 넘칠 시 스크롤 */
  border-radius: 8px;
}

.report-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 12px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.count {
  color: #4a90e2;
  font-weight: 600;
  margin-left: 6px;
}
</style>
