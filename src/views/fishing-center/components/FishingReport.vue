<script setup>
import { onMounted } from 'vue'
import { useFishingReportStore } from '@/store/fishing-center/fishingReportStore'

const reportStore = useFishingReportStore()

onMounted(() => {
  reportStore.fetchReports()
})
</script>

<template>
  <div class="fishing-report">
    <h1>조황정보</h1>
    <ul>
      <li v-for="report in reportStore.reports" :key="report.id">
        {{ report.title }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
</style>
