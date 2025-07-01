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
      v-for="report in props.reports"
      :key="report.frId"
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
