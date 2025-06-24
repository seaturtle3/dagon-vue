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
  window.open(`/fishing-report/${props.report.frId}`)
}
</script>

<template>
  <div class="report-card"
       @click="goToDetail">
    <img
        class="thumbnail"
        :src="report.image_data ? `data:image/jpeg;base64,${report.image_data}` : `${IMAGE_BASE_URL}/fishing-report/${report.thumbnailUrl}`"
    />
    <div class="content">
      <strong>{{ report.product?.prodName }}</strong>
      <h6>{{ report.title }}</h6>
      <small>{{ report.fishingAt || '날짜 없음' }}</small>
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
  padding: 8px 12px;
}
</style>
