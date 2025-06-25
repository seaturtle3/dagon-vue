<script setup>
import { useRouter } from 'vue-router'
import { useProductFishingDiaryStore } from '@/store/product/product-detail/useProductFishingDiaryStore.js'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const router = useRouter()
const store = useProductFishingDiaryStore()

const goToDetail = (diary) => {
  router.push(`/fishing-diary/${diary.fdId}`)
}
</script>

<template>
  <div class="list-container">
    <div v-if="store.loading">로딩중...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <div v-else>

      <div v-if="store.diary.length > 0" class="diary-grid">
        <div
            v-for="diary in store.diary.slice(0, 15)"
            :key="diary.fdId"
            class="item-box"
            @click="goToDetail(diary)"
            style="cursor: pointer"
        >
          <div class="thumbnail-wrapper">
            <img
                v-if="diary.thumbnailUrl"
                class="thumbnail"
                :src="`${IMAGE_BASE_URL}/fishing-diary/${diary.thumbnailUrl}`"
            />
            <div v-else class="image-placeholder">
              <i class="fas fa-image"></i>
              <span>이미지 없음</span>
            </div>
          </div>
          <div class="item-content">
            <h3>{{ diary.product?.prodName }}</h3>
            <h5>{{ diary.title }}</h5>
            <small>{{ diary.fishingAt ? diary.fishingAt.slice(0, 10) : '날짜 없음' }}</small>
          </div>
        </div>
      </div>
      <!-- <div v-else>조황정보가 없습니다.</div> -->
    </div>
  </div>
</template>

<style scoped>
.list-container {
  width: 100%;
  margin: 0 auto;
}

.diary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 10px 0;
}

.item-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 400px;
  padding: 0; /* 패딩 제거 */
}
.item-content {
  height: 40%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-content h3 {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.item-content h5 {
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

.item-content small {
  color: #999;
  font-size: 0.85rem;
}

.thumbnail-wrapper {
  height: 60%;
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
  justify-content: center;
  align-items: center;
  height: 100%;
}

.image-placeholder i {
  font-size: 2rem;
  color: #999;
  margin-bottom: 8px;
}

.image-placeholder span {
  color: #999;
  font-size: 0.85rem;
}
</style>
