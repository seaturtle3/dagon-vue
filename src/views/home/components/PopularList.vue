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
      <h2 class="title mb-3">인기 조황정보</h2>
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
        <!-- 썸네일 영역 (60% 고정) -->
        <div class="thumbnail-section">
          <img
            class="thumbnail"
            :src="
            report.images && report.images.length
              ? (
                  report.images[0].imageData
                    ? `data:image/jpeg;base64,${report.images[0].imageData}`
                    : (report.images[0].image_data
                        ? `data:image/jpeg;base64,${report.images[0].image_data}`
                        : (report.images[0].imageUrl
                            ? report.images[0].imageUrl
                            : (report.images[0].image_url
                                ? report.images[0].image_url
                                : '/images/no-image.png'
                              )
                          )
                      )
                )
              : '/images/no-image.png'
          "
            alt="썸네일"
            v-if="
              report.images?.imageData ||
              report.images?.image_data ||
              report.images?.imageUrl ||
              report.images?.image_url ||
              report.images
            "
          />
          <div v-else class="image-placeholder">
            <i class="fas fa-image"></i>
            <span>이미지 없음</span>
          </div>
        </div>

        <div class="report-info">
          <div class="report-title">{{ report.prodName }}</div>
          <small class="mb-3">{{ report.title }}</small>
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
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  width: 100%;
}

.report-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 280px;
}

.thumbnail-section {
  height: 60%;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
}

.image-placeholder i {
  font-size: 1.5rem;
  margin-bottom: 6px;
  color: #cbd5e0;
}

.image-placeholder span {
  font-size: 0.75rem;
  color: #a0aec0;
}

.report-info {
  height: 40%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
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