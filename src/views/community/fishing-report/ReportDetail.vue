<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFishingReportStore } from "@/store/fishing-center/useFishingReportStore.js"
import ReportDetailItem from "@/views/community/fishing-report/components/ReportDetailItem.vue";

const store = useFishingReportStore()
const route = useRoute()
const id = route.params.frId

onMounted(async () => {
  await store.fetchReportById(id)
})

</script>

<template>
  <div class="center" >
    <ReportDetailItem :report="store.currentReport" v-if="store.currentReport"/>
    <p v-else>조황 정보를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>