<!-- src/views/fishing-center/components/FishingReportList.vue -->
<script setup>
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
      <h3>제목: {{ report.title }}</h3>
      <p>내용: {{ report.content }}</p>
      <p>날짜: {{ report.fishingAt ? report.fishingAt.slice(0, 10) : '날짜 없음' }}</p>
      <p>상품명: {{ report.product?.prodName }}</p>
      <p>작성자: {{ report.user?.uname }}</p>
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
  padding: 12px;
  background-color: #f9f9f9;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
