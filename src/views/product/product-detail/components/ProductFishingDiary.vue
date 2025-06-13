<script setup>
import {computed, onMounted} from 'vue'
import { useRoute } from 'vue-router'
import { useProductFishingDiaryStore } from '@/store/product/product-detail/useProductFishingDiaryStore.js'

const route = useRoute()
const store = useProductFishingDiaryStore()

onMounted(() => {
  const prodId = Number(route.params.prodId)
  console.log('상세페이지 조행기 - productId:', prodId)
  store.fetchFishingDiary(prodId)
})

const diaryCount = computed(() => store.diary?.length || 0)
</script>

<template>
  <div v-if="store.loading">로딩중...</div>
  <div v-else-if="store.error">{{ store.error }}</div>
  <div v-else>

    <h2 class="mb-3 font-bold text-lg">
      조행기 <span class="count">({{ diaryCount }})</span>
    </h2>

    <div v-if="store.diary.length > 0" class="diary-grid">
      <div
          v-for="diary in store.diary.slice(0, 15)"
      :key="diary.fdId"
      class="diary-box"
      >
      <h3>제목: {{ diary.title }}</h3>
      <p>내용: {{ diary.content }}</p>
      <p>날짜: {{ diary.fishingAt || '날짜 없음' }}</p>
      <p>상품명: {{ diary.product?.prodName }}</p>
      <p>작성자: {{ diary.user?.uname }}</p>
    </div>
  </div>
  <!-- <div v-else>조황정보가 없습니다.</div> -->
  </div>
</template>

<style scoped>
.diary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3열 */
  grid-auto-rows: minmax(150px, auto); /* 각 행 최소 높이 150px */
  gap: 16px; /* 박스 간 간격 */
  max-height: calc(150px * 5 + 16px * 4); /* 5행 높이 + 간격 */
  overflow-y: auto; /* 넘칠 시 스크롤 */
}

.diary-box {
  border: 1px solid #aaa; /* 각 박스만 테두리 */
  border-radius: 6px;
  padding: 12px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.count {
  color: #4a90e2;
  font-weight: 600;
  margin-left: 6px;
}
</style>
