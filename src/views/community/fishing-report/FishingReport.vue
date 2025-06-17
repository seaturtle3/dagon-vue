<script setup>
import { onMounted } from 'vue'
import { useFishingReportStore } from '@/store/fishing-center/useFishingReportStore.js'
import ReportListView from "@/views/community/fishing-report/components/ReportListView.vue";

const store = useFishingReportStore()

onMounted(async () => {
  await store.fetchReports()
  console.log('-------------reports : ', store.reports)
})
</script>

<template>
  <div class="center">
    <h1>조황정보</h1>
    <ReportListView v-if="store.reports.length" :reports="store.reports" />
    <p v-else>조황 정보를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>
