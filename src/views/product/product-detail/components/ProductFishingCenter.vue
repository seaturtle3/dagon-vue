<script setup>
import { onMounted, computed } from 'vue'
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

const combinedList = computed(() => {
  const combined = [
    ...store.report.map(center => ({ ...center, _type: 'report' })),
    ...store.diary.map(center => ({ ...center, _type: 'diary' })),
  ]
  return combined
      .sort((a, b) => {
        if (!a.fishingAt && !b.fishingAt) return 0
        if (!a.fishingAt) return 1
        if (!b.fishingAt) return -1
        return new Date(b.fishingAt) - new Date(a.fishingAt)
      })
      .slice(0, 15)
})

const totalCount = computed(() => {
  const reportCount = store.report ? store.report.length : 0
  const diaryCount = store.diary ? store.diary.length : 0
  return reportCount + diaryCount
})
</script>

<template>
  <div v-if="store.loading">로딩중...</div>
  <div v-else-if="store.error" class="text-red-500">{{ store.error }}</div>
  <div v-else>

    <h2 class="mb-3 font-bold text-lg">
      조황정보/조행기 <span class="count">({{ totalCount }})</span>
    </h2>

    <section v-if="combinedList.length > 0">
      <div class="combined-grid">
        <div
            v-for="center in combinedList"
            :key="center._type + '-' + (center.frId || center.fdId)"
            class="combined-box"
        >
          <p><strong>구분:</strong> {{ center._type === 'report' ? '조황정보' : '조행기' }}</p>
          <p><strong>제목:</strong> {{ center.title }}</p>
          <p><strong>내용:</strong> {{ center.content }}</p>
          <p>날짜: {{ center.fishingAt ? center.fishingAt.slice(0, 10) : '날짜 없음' }}</p>
          <p><strong>상품명:</strong> {{ center.product?.prodName }}</p>
          <p><strong>작성자:</strong> {{ center.user?.uname }}</p>
        </div>
      </div>
    </section>
    <div v-else class="text-gray-500">표시할 조황정보나 조행기가 없습니다.</div>
  </div>
</template>

<style scoped>
.combined-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(150px, auto);
  gap: 16px;
  max-height: calc(150px * 5 + 16px * 4);
  overflow-y: auto;
  padding: 10px 0;
}

.combined-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 12px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

strong {
  font-weight: 600;
}

.count {
  color: #4a90e2;
  font-weight: 600;
  margin-left: 6px;
}
</style>
