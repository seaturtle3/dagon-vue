<script setup>
import { useRouter } from 'vue-router'
import { convertToRelativeUrl } from '@/utils/authUtils.js'

const router = useRouter()
const props = defineProps({
  report: {
    type: Object,
    required: true
  }
});

const goToDetail = () => {
  router.push(`/fishing-report/${props.report.frId}`)
}

// 이미지 URL 생성 함수 (목록보기에서는 thumbnailData 우선)
const getImageUrl = (report) => {
  console.log(`🔍 [ReportCard] 조황정보 ID ${report.frId} 이미지 디버깅:`, {
    title: report.title,
    imagesCount: report.images?.length || 0
  })

  // images 배열에서 썸네일 우선 (목록보기에서는 thumbnailData 우선)
  if (report.images && report.images.length > 0) {
    // 썸네일 이미지 찾기
    const thumbnailImage = report.images.find(img => img.isThumbnail)
    if (thumbnailImage) {
      // 목록보기에서는 thumbnailData 우선 (빠른 로딩)
      if (thumbnailImage.thumbnailData) {
        console.log(`✅ [ReportCard] 조황정보 ID ${report.frId}: images[thumbnail].thumbnailData 사용`)
        return `data:image/jpeg;base64,${thumbnailImage.thumbnailData}`
      }
      if (thumbnailImage.imageData) {
        console.log(`✅ [ReportCard] 조황정보 ID ${report.frId}: images[thumbnail].imageData 사용`)
        return `data:image/jpeg;base64,${thumbnailImage.imageData}`
      }
      if (thumbnailImage.imageUrl) {
        console.log(`✅ [ReportCard] 조황정보 ID ${report.frId}: images[thumbnail].imageUrl 사용`)
        return convertToRelativeUrl(thumbnailImage.imageUrl)
      }
    }
    
    // 썸네일이 없으면 첫 번째 이미지 사용
    const firstImage = report.images[0]
    if (firstImage.thumbnailData) {
      console.log(`✅ [ReportCard] 조황정보 ID ${report.frId}: images[0].thumbnailData 사용`)
      return `data:image/jpeg;base64,${firstImage.thumbnailData}`
    }
    if (firstImage.imageData) {
      console.log(`✅ [ReportCard] 조황정보 ID ${report.frId}: images[0].imageData 사용`)
      return `data:image/jpeg;base64,${firstImage.imageData}`
    }
    if (firstImage.imageUrl) {
      console.log(`✅ [ReportCard] 조황정보 ID ${report.frId}: images[0].imageUrl 사용`)
      return convertToRelativeUrl(firstImage.imageUrl)
    }
  }
  
  // 기본 이미지
  console.log(`⚠️ [ReportCard] 조황정보 ID ${report.frId}: 기본 이미지 사용 (no-image.png)`)
  return '/images/no-image.png'
}
</script>

<template>
  <div class="report-card" @click="goToDetail">
    <div class="thumbnail-section">
      <img
        class="thumbnail"
        :src="getImageUrl(report)"
        alt="썸네일"
        v-if="report.images && report.images.length > 0"
      />
      <div v-else class="image-placeholder">
        <i class="fas fa-image"></i>
        <span>이미지 없음</span>
      </div>
    </div>
    <div class="content">
      <h3 class="product-name">{{ report.product?.prodName }}</h3>
      <h5 class="report-title">{{ report.title }}</h5>
      <small class="report-date">{{ report.fishingAt ? report.fishingAt.slice(0, 10) : '날짜 없음' }}</small>
    </div>
  </div>
</template>

<style scoped>
.report-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 260px;
  transition: border-color 0.18s, transform 0.12s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.report-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  object-position: center;
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

.content {
  height: 40%;
  padding: 14px 12px 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  background-color: #f7f8fa;
}

.product-name {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 4px 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-title {
  font-size: 1rem;
  color: #1f2937;
  margin: 0;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.report-date {
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: auto;
  flex-shrink: 0;
}
</style>
