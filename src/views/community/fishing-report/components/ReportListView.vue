<!-- views/community/fishing-report/components/ReportListView.vue -->
<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import ReportCard from './ReportCard.vue'

const props = defineProps({
  reports: {
    type: Array,
    required: true
  }
})

const pageSize = 12
const visibleCount = ref(pageSize)

const visibleReports = computed(() => props.reports.slice(0, visibleCount.value))

// 스크롤 이벤트 핸들러
const handleScroll = () => {
  const scrollY = window.scrollY || window.pageYOffset
  const viewportHeight = window.innerHeight
  const fullHeight = document.documentElement.scrollHeight

  // 바닥 근처에 도달하면 10개 추가
  if (scrollY + viewportHeight + 100 >= fullHeight) {
    if (visibleCount.value < props.reports.length) {
      visibleCount.value += pageSize
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(() => props.reports, () => {
  visibleCount.value = pageSize
})
</script>

<template>
  <div>
    <div class="grid-container">
      <ReportCard
        v-for="report in visibleReports"
        :key="report.frId"
        :report="report"
      />
    </div>
    <div v-if="visibleCount < props.reports.length" class="loading-more">
      더 불러오는 중...
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-top: 20px;
}
.loading-more {
  text-align: center;
  color: #888;
  margin: 2rem 0;
}
</style>
