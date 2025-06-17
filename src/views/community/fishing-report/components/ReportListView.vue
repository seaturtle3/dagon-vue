<!-- views/community/fishing-report/components/ReportListView.vue -->
<script setup>
import ReportCard from './ReportCard.vue'

const props = defineProps({
  reports: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="grid-container">
    <ReportCard
        v-for="report in reports.slice(0, 18)"
        :key="report.id"
        :report="report"
    />
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-top: 20px;
}
</style>
