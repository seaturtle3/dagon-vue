<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductFishingCenterStore } from '@/store/product/product-detail/useProductFishingCenterStore'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

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
          <!-- 뱃지 -->
          <div
              class="badge"
              :class="center._type === 'diary' ? 'badge-diary' : 'badge-report'"
          >
            {{ center._type === 'report' ? '조황정보' : '조행기' }}
          </div>

          <!-- 썸네일 -->
          <div v-if="center.thumbnailUrl" class="thumbnail-wrapper">
            <img
                class="thumbnail"
                :src="`${IMAGE_BASE_URL}/${center._type === 'report' ? 'fishing-report' : 'fishing-diary'}/${center.thumbnailUrl}`"
                alt="썸네일"
            />
          </div>

          <!-- 텍스트 영역 -->
          <div class="combined-content">
            <h4>제목: {{ center.title }}</h4>
            <p><strong>상품명:</strong> {{ center.product?.prodName }}</p>
            <p><strong>작성자:</strong> {{ center.user?.uname }}</p>
            <p><strong>날짜:</strong> {{ center.fishingAt ? center.fishingAt.slice(0, 10) : '날짜 없음' }}</p>
          </div>
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

strong {
  font-weight: 600;
}

.count {
  color: #4a90e2;
  font-weight: 600;
  margin-left: 6px;
}

.combined-box {
  position: relative; /* 뱃지 포지셔닝용 */
  border: 1px solid #aaa;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 400px;
  padding: 0;
}
.combined-content {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.combined-content p {
  margin: 0;
}

.thumbnail-wrapper {
  height: 60%; /* 전체 높이의 60% */
}
.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 0 0 6px 0;
  z-index: 1;
}
.badge-report {
  background-color: #4a90e2; /* 파랑 */
}
.badge-diary {
  background-color: #4caf50; /* 초록 */
}

</style>
