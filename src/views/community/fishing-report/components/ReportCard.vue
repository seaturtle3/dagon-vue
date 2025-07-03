<script setup>
import { useRouter } from 'vue-router'

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
</script>

<template>
  <div class="report-card" @click="goToDetail">
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
