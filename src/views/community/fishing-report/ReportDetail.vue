<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFishingReportStore } from "@/store/fishing-center/useFishingReportStore.js"
import ReportDetailItem from "@/views/community/fishing-report/components/ReportDetailItem.vue";

const store = useFishingReportStore()
const route = useRoute()
const reportId = useRoute()

onMounted(async () => {
  await store.fetchReportById(reportId)
})

</script>

<template>
  <div class="detail-wrapper">
    <ReportDetailItem :report="store.currentReport" v-if="store.currentReport" />
    <p v-else>조황 정보를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.detail-wrapper {
  width: 80%;
  margin: 0 auto;
  padding-top: 40px;
}
</style>