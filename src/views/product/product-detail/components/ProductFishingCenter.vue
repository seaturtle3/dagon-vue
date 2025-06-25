<script setup>
import { computed } from 'vue'
import { useProductFishingCenterStore } from '@/store/product/product-detail/useProductFishingCenterStore'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const store = useProductFishingCenterStore()

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

// 상세 페이지로 이동 함수
const goToDetail = (item) => {
  if (!item || !item._type) return
  const basePath = item._type === 'report' ? 'fishing-report' : 'fishing-diary'
  const id = item._type === 'report' ? item.frId : item.fdId
  window.location.href = `/${basePath}/${id}` // ← 기존 창 이동
}
</script>

<template>
  <div class="list-container">
    <div v-if="store.loading">로딩중...</div>
    <div v-else-if="store.error" class="text-red-500">{{ store.error }}</div>
    <div v-else>
      <section v-if="combinedList.length > 0">
        <div class="combined-grid">
          <div
              v-for="center in combinedList"
              :key="center._type + '-' + (center.frId || center.fdId)"
              class="combined-box"
              @click="goToDetail(center)"
              style="cursor: pointer"
          >
            <!-- 뱃지 -->
            <div
                class="badge"
                :class="center._type === 'diary' ? 'badge-diary' : 'badge-report'"
            >
              {{ center._type === 'report' ? '조황정보' : '조행기' }}
            </div>

            <!-- 썸네일 -->
            <div class="thumbnail-wrapper">
              <img
                  v-if="center.thumbnailUrl"
                  class="thumbnail"
                  :src="`${IMAGE_BASE_URL}/${center._type === 'report' ? 'fishing-report' : 'fishing-diary'}/${center.thumbnailUrl}`"
                  alt="썸네일"
              />
              <div v-else class="image-placeholder">
                <i class="fas fa-image"></i>
                <span>이미지 없음</span>
              </div>
            </div>

            <!-- 텍스트 영역 -->
            <div class="combined-content">
              <h3>{{ center.product?.prodName }}</h3>
              <h5>{{ center.title }}</h5>
              <small>{{ center.fishingAt ? center.fishingAt.slice(0, 10) : '날짜 없음' }}</small>
            </div>
          </div>
        </div>
      </section>
      <div v-else class="text-gray-500">표시할 조황정보나 조행기가 없습니다.</div>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  width: 100%;
  margin: 0 auto;
}

.combined-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 40%;
}

.combined-content h3 {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.combined-content h5 {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.combined-content small {
  color: #999;
  font-size: 0.85rem;
}

.thumbnail-wrapper {
  height: 60%; /* 전체 높이의 60% */
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.image-placeholder i {
  font-size: 24px;
  color: #999;
}

.image-placeholder span {
  font-size: 0.8rem;
  color: #999;
  margin-top: 8px;
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

