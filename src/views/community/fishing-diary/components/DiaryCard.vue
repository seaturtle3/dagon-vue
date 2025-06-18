<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js"
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  diary: {
    type: Object,
    required: true
  }
})

const goToDetail = () => {
  window.open(`/fishing-diary/${props.diary.fdId}`)
}
</script>

<template>
  <div class="diary-card"
       @click="goToDetail">
    <img
        class="thumbnail"
        :src="`${IMAGE_BASE_URL}/fishing-diary/${diary.thumbnailUrl}`"
        alt="썸네일"
    />
    <div class="content">
      <strong>{{ diary.product?.prodName }}</strong>
      <h6>{{ diary.title }}</h6>
      <small>{{ diary.fishingAt || '날짜 없음' }}</small>
    </div>
  </div>
</template>

<style scoped>
.diary-card {
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
  border-radius: 6px;
  margin-bottom: 8px;
  display: block;
  flex-shrink: 0;
}

.content {
  padding: 8px 12px;
}
</style>
