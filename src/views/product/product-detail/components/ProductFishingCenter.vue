<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductFishingCenterStore } from '@/store/product/product-detail/useProductFishingCenterStore'

const route = useRoute()
const store = useProductFishingCenterStore()

onMounted(() => {
  const prodId = Number(route.params.prodId)
  console.log('상세페이지 조황센터 - productId:', prodId)

  if (!isNaN(prodId)) {
    store.fetchFishingCenter(prodId).then(() => {
      console.log('report:', store.report)
      console.log('diary:', store.diary)
    })
  } else {
    console.warn('올바르지 않은 productId입니다.')
  }
})
</script>

<template>
  <div class="p-4">
    <div v-if="store.loading">로딩중...</div>
    <div v-else-if="store.error" class="text-red-500">{{ store.error }}</div>
    <div v-else>
      <!-- 조황정보 -->
      <section v-if="store.report && store.report.length > 0">
        <h2 class="text-xl font-bold mb-2">조황정보</h2>
        <div
            v-for="report in store.report"
            :key="report.frId"
            class="border rounded p-3 mb-4 shadow-sm"
        >
          <p><strong>제목:</strong> {{ report.title }}</p>
          <p><strong>내용:</strong> {{ report.content }}</p>
          <p><strong>날짜:</strong> {{ report.fishingAt || '날짜 없음' }}</p>
          <p><strong>상품명:</strong> {{ report.product?.prodName }}</p>
          <p><strong>작성자:</strong> {{ report.user?.uname }}</p>
        </div>
      </section>
      <div v-else class="text-gray-500 mb-6">조황정보가 없습니다.</div>

      <!-- 조행기 -->
      <section v-if="store.diary && store.diary.length > 0">
        <h2 class="text-xl font-bold mb-2">조행기</h2>
        <div
            v-for="diary in store.diary"
            :key="diary.fdId"
            class="border rounded p-3 mb-4 shadow-sm"
        >
          <p><strong>제목:</strong> {{ diary.title }}</p>
          <p><strong>내용:</strong> {{ diary.content }}</p>
          <p><strong>날짜:</strong> {{ diary.fishingAt || '날짜 없음' }}</p>
          <p><strong>상품명:</strong> {{ diary.product?.prodName }}</p>
          <p><strong>작성자:</strong> {{ diary.user?.uname }}</p>
        </div>
      </section>
      <div v-else class="text-gray-500">조행기가 없습니다.</div>
    </div>
  </div>
</template>

<style scoped>
/* 필요하면 커스텀 스타일 추가 */
</style>
