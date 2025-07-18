<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IMAGE_BASE_URL } from '@/constants/imageBaseUrl.js'
import { convertToRelativeUrl } from '@/utils/authUtils.js'

const props = defineProps({
  reports: {
    type: Array,
    required: true
  }
})

const router = useRouter()

// 인기 조황정보 12개 (props로 받은 데이터 사용)
const topReports = computed(() =>
    props.reports
        .slice(0, 12) // 12개만
)

const goToDetail = (report) => {
  router.push(`/fishing-report/${report.frId}`)
}

const getImageUrl = (report) => {
  console.log(`🔍 [PopularList] 조황정보 ID ${report.frId} 이미지 디버깅:`, {
    title: report.title,
    imagesCount: report.images?.length || 0
  })

  // images 배열에서 썸네일 우선 (목록보기에서는 thumbnailData 우선)
  if (report.images && report.images.length > 0) {
    console.log(`🔍 [PopularList] 조황정보 ID ${report.frId}: images 배열 확인 (${report.images.length}개)`)
    
    // 썸네일 이미지 찾기
    const thumbnailImage = report.images.find(img => img.isThumbnail)
    if (thumbnailImage) {
      console.log(`🔍 [PopularList] 조황정보 ID ${report.frId}: 썸네일 이미지 발견`)
      // 목록보기에서는 thumbnailData 우선
      if (thumbnailImage.thumbnailData) {
        console.log(`✅ [PopularList] 조황정보 ID ${report.frId}: images[].thumbnailData 사용 (목록보기)`)
        return `data:image/jpeg;base64,${thumbnailImage.thumbnailData}`
      }
      if (thumbnailImage.imageData) {
        console.log(`✅ [PopularList] 조황정보 ID ${report.frId}: images[].imageData 사용 (목록보기)`)
        return `data:image/jpeg;base64,${thumbnailImage.imageData}`
      }
      if (thumbnailImage.imageUrl) {
        console.log(`✅ [PopularList] 조황정보 ID ${report.frId}: images[].imageUrl 사용 (목록보기)`)
        return convertToRelativeUrl(thumbnailImage.imageUrl)
      }
    }
    
    // 첫 번째 이미지 사용
    const firstImage = report.images[0]
    console.log(`🔍 [PopularList] 조황정보 ID ${report.frId}: 첫 번째 이미지 사용`)
    // 목록보기에서는 thumbnailData 우선
    if (firstImage.thumbnailData) {
      console.log(`✅ [PopularList] 조황정보 ID ${report.frId}: images[0].thumbnailData 사용 (목록보기)`)
      return `data:image/jpeg;base64,${firstImage.thumbnailData}`
    }
    if (firstImage.imageData) {
      console.log(`✅ [PopularList] 조황정보 ID ${report.frId}: images[0].imageData 사용 (목록보기)`)
      return `data:image/jpeg;base64,${firstImage.imageData}`
    }
    if (firstImage.imageUrl) {
      console.log(`✅ [PopularList] 조황정보 ID ${report.frId}: images[0].imageUrl 사용 (목록보기)`)
      return convertToRelativeUrl(firstImage.imageUrl)
    }
  }
  
  // 기본 이미지
  console.log(`⚠️ [PopularList] 조황정보 ID ${report.frId}: 기본 이미지 사용 (no-image.png)`)
  return '/images/no-image.png'
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
            :src="getImageUrl(report)"
            alt="썸네일"
          />
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
  margin-bottom: 18px;
  position: relative;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.view-all {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.95rem;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}
.view-all:hover {
  background: #e5e7eb;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
  width: 100%;
}

.report-card {
  background: #fff;
  border-radius: 8px;
  /* border: 1.2px solid #e5e7eb; */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 260px;
  transition: border-color 0.18s, transform 0.12s;
}
.report-card:hover {
  border-color: #bfc5cb;
  transform: translateY(-2px) scale(1.01);
}

.thumbnail-section {
  height: 60%;
  overflow: hidden;
  flex-shrink: 0;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #bfc5cb;
  font-size: 1rem;
}
.image-placeholder i {
  font-size: 1.7rem;
  margin-bottom: 6px;
  color: #d1d5db;
}
.image-placeholder span {
  font-size: 0.8rem;
  color: #bfc5cb;
}

.report-info {
  height: 40%;
  padding: 14px 12px 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  background-color: #f7f8fa;
}

.report-title {
  font-weight: 700;
  margin-bottom: 4px;
  color: #222;
  font-size: 1rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.report-date {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 6px;
}
small {
  color: #666;
  font-size: 0.92rem;
  margin-bottom: 2px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .report-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 900px) {
  .report-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>