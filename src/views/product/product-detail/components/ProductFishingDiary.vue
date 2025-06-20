<script setup>
import {computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useProductFishingDiaryStore} from '@/store/product/product-detail/useProductFishingDiaryStore.js'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const route = useRoute()
const router = useRouter()
const store = useProductFishingDiaryStore()

onMounted(() => {
  const prodId = Number(route.params.prodId)
  console.log('상세페이지 조행기 - productId:', prodId)
  store.fetchFishingDiary(prodId)
})

const diaryCount = computed(() => store.diary?.length || 0)

const goToDetail = (diary) => {
  router.push(`/fishing-diary/${diary.fdId}`)
}
</script>

<template>
  <div class="list-container">
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
            class="item-box"
            @click="goToDetail(diary)"
            style="cursor: pointer"
        >
          <div class="thumbnail-wrapper">
            <img
                class="thumbnail"
                :src="`${IMAGE_BASE_URL}/fishing-diary/${diary.thumbnailUrl}`"
            />
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
  width: 80%;
  margin: 0 auto;
}

.diary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3열 */
  grid-auto-rows: minmax(150px, auto); /* 각 행 최소 높이 150px */
  gap: 16px; /* 박스 간 간격 */
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
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.thumbnail-wrapper {
  height: 60%;
}
.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
