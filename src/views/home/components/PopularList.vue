<script setup>
import { useFishingReportStore } from '@/store/fishing-center/useFishingReportStore.js'
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IMAGE_BASE_URL } from '@/constants/imageBaseUrl.js'

const store = useFishingReportStore()
const router = useRouter()

onMounted(() => {
  if (!store.reports.length) {
    store.fetchReports()
  }
})

// 인기 조황정보 10개 (필요하다면 정렬 조건 추가)
const topReports = computed(() =>
    store.reports
        .slice(0, 10) // 또는 정렬 후 slice
)

const goToDetail = (report) => {
  router.push(`/fishing-report/${report.frId}`)
}
</script>

<template>
  <div class="popular-section">
    <div class="header">
      <h2 class="title">인기 조황정보</h2>
      <button class="view-all" @click="router.push('/fishing-report')">전체보기 </button>
    </div>

    <div class="report-grid">
      <div
          v-for="report in topReports"
          :key="report.frId"
          class="report-card"
          @click="goToDetail(report)"
          style="cursor: pointer"
      >
        <!-- 썸네일 이미지 -->
        <img
            class="thumbnail"
            :src="`${IMAGE_BASE_URL}/fishing-report/${report.thumbnailUrl}`"
            alt="썸네일"
        />

        <div class="report-info">
          <h5 class="report-title">{{ report.prodName }}</h5>
          <h6 class="report-title">{{ report.title }}</h6>
          <p class="report-date">{{ report.fishingAt?.slice(0, 10) || '날짜 없음' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.view-all {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 14px;
  color: #4a90e2;
  background: none;
  border: none;
  cursor: pointer;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.report-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 150px;
  height: auto;
}

.thumbnail {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.report-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.report-title {
  font-weight: bold;
  margin-bottom: 4px;
}
.report-date {
  font-size: 12px;
  color: #777;
  margin-bottom: 6px;
}
.report-user {
  font-size: 12px;
  color: #888;
  margin-top: auto;
}
</style>