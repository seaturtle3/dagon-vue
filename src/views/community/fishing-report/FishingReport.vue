<script setup>
import { onMounted } from 'vue'
import { useFishingReportStore } from '@/store/fishing-center/useFishingReportStore.js'
import FishingReportList from "@/views/community/fishing-report/components/FishingReportList.vue";

const store = useFishingReportStore()

onMounted(() => {
  store.fetchReports()
})
</script>

<template>
  <div class="fishing-report center">
    <h1>조황정보</h1>
  <FishingReportList :reports="store.reports" />
  </div>
</template>

<style scoped>
.fishing-report {
  padding: 20px;
}

.center {
  width: 80%;
  margin: 5% auto;
}
</style>
