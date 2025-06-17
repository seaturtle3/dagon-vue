<script setup>
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const props = defineProps({
  diaries: {
    type: Array,
    required: false,
    default: () => []
  }
})
</script>

<template>
  <div class="grid-container">
    <div
        class="diary-card"
        v-for="diary in diaries.slice(0, 18)"
        :key="diary.id"
    >
      <!-- 썸네일 이미지 -->
      <img
          class="thumbnail"
          :src="`${IMAGE_BASE_URL}/fishing-diary/${diary.thumbnailUrl}`"
      />

      <h4>제목: {{ diary.title }}</h4>
      <p>상품명: {{ diary.product?.prodName }}</p>
      <p>작성자: {{ diary.user?.uname }}</p>
      <p>날짜: {{ diary.fishingAt || '날짜 없음' }}</p>
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
}

.thumbnail {
  width: 100%;
  height: 60%;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}
</style>
