<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js";
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  report: {
    type: Object,
    required: true
  }
});

console.log('ReportCard ID:', props.report?.frId)

const goToDetail = () => {
  router.push(`/fishing-report/${props.report.frId}`)
}
</script>

<template>
  <div class="report-card"
       @click="goToDetail">
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
    />
    <div class="content">
      <h3 class="product-name">{{ report.product?.prodName }}</h3>
      <h5 class="report-title">{{ report.title }}</h5>
      <small class="report-date">{{ report.fishingAt ? report.fishingAt.slice(0, 10) : '날짜 없음' }}</small>
    </div>
  </div>
</template>

<style scoped>
.report-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: start;
  height: 300px;
  cursor: pointer;
}

.thumbnail {
  width: 100%;
  height: 60%;
  object-fit: cover;
  object-position: center;
  margin-bottom: 8px;
  display: block;
  flex-shrink: 0;
}

.content {
  height: 40%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 4px 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-title {
  font-size: 1rem;
  color: #333;
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
  color: #999;
  font-size: 0.8rem;
  margin-top: auto;
  flex-shrink: 0;
}
</style>
