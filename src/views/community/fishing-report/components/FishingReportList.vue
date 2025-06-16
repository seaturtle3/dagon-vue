<script setup>
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const props = defineProps({
  reports: {
    type: Array,
    required: false,
    default: () => []
  }
})
</script>

<template>
  <div class="grid-container">
    <div
        class="report-card"
        v-for="report in reports.slice(0, 18)"
        :key="report.id"
    >
      <!-- 썸네일 이미지 -->
      <img
          class="thumbnail"
          :src="`${IMAGE_BASE_URL}/fishing-report/${report.thumbnailUrl}`"
      />

      <h3>제목: {{ report.title }}</h3>
      <p>상품명: {{ report.product?.prodName }}</p>
      <p>작성자: {{ report.user?.uname }}</p>
      <p>날짜: {{ report.fishingAt || '날짜 없음' }}</p>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: 16px;
  margin-top: 20px;
}

.report-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: start;
  height: 100%; /* grid-auto-rows 기준 따라감 */
}

.thumbnail {
  width: 100%;
  height: 50%; /* 전체 박스 높이의 50% */
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}
</style>
