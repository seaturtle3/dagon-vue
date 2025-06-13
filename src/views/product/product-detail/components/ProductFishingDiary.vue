<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductFishingDiaryStore } from '@/store/product/product-detail/useProductFishingDiaryStore.js'

const route = useRoute()
const store = useProductFishingDiaryStore()

onMounted(() => {
  const prodId = Number(route.params.prodId)
  console.log('상세페이지 조행기 - productId:', prodId)
  store.fetchFishingDiary(prodId)
})
</script>

<template>
  <div v-if="store.loading">로딩중...</div>
  <div v-else-if="store.error">{{ store.error }}</div>
  <div v-else>
    <div v-if="store.diary.length > 0">
      <div v-for="diary in store.diary" :key="diary.fdId" class="mb-4">
        <h3>제목: {{ diary.title }}</h3>
        <p>내용: {{ diary.content }}</p>
        <p>날짜: {{ diary.fishingAt || '날짜 없음' }}</p>
        <p>상품명: {{ diary.product?.prodName }}</p>
        <p>작성자: {{ diary.user?.uname }}</p>
        <hr>
      </div>
    </div>
<!--    <div v-else>조황정보가 없습니다.</div>-->
  </div>
</template>
