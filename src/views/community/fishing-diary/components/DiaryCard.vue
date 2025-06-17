<!-- views/community/fishing-diary/components/DiaryCard.vue -->
<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js"

const props = defineProps({
  diary: Object
})
</script>

<template>
  <div class="diary-card">
    <img
        class="thumbnail"
        :src="`${IMAGE_BASE_URL}/fishing-diary/${diary.thumbnailUrl}`"
        alt="썸네일"
    />
    <h4>제목: {{ diary.title }}</h4>
    <p>상품명: {{ diary.product?.prodName }}</p>
    <p>작성자: {{ diary.user?.uname }}</p>
    <p>날짜: {{ diary.fishingAt || '날짜 없음' }}</p>
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
</style>
