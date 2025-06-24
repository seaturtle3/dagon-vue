<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useFishingReportStore } from '@/store/fishing-center/useFishingReportStore.js'
import ReportListView from "@/views/community/fishing-report/components/ReportListView.vue";

const store = useFishingReportStore()

const handleScroll = () => {
  const scrollY = window.scrollY || window.pageYOffset
  const viewportHeight = window.innerHeight
  const fullHeight = document.documentElement.scrollHeight

  if (
    scrollY + viewportHeight + 100 >= fullHeight &&
    !store.loading &&
    store.currentPage + 1 < store.totalPages
  ) {
    store.fetchReports(store.currentPage + 1, store.pageSize)
  }
}

onMounted(async () => {
  if (store.reports.length === 0) {
    await store.fetchReports(0, store.pageSize)
  }
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="center">
    <h4>조황정보</h4>
    <ReportListView v-if="store.reports.length" :reports="store.reports" />
    <p v-else>조황 정보를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
.note-modal, .note-dialog {
  z-index: 3001 !important;
}
.note-modal-backdrop {
  z-index: 3000 !important;
}
</style>
