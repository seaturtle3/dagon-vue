<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFishingCenterStore } from '@/store/product/fishing-center/fishingCenterStore.js'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

console.log(IMAGE_BASE_URL);
console.log(import.meta.env.VITE_IMAGE_BASE_URL); // undefined가 나오면 설정 문제

const store = useFishingCenterStore()
const currentPage = ref(0)
const pageSize = 8
const router = useRouter()

onMounted(() => {
  store.fetchProducts()
})

const paginatedProducts = computed(() => {
  const sorted = [...store.products].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  const start = currentPage.value * pageSize
  return sorted.slice(start, start + pageSize)
})

function goToFishingCenter() {
  router.push('/fishing-center')
}

function onClick(product) {
  const url = `/product-detail/${product.prodId}`
  window.open(url, '_blank')  // 새 탭에서 열기
}
</script>

<template>
  <div style="margin-top: 5%">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="fw-bold fs-5 m-0">최근 인기 조황</h2>
      <button class="btn btn-sm btn-outline-secondary" @click="goToFishingCenter">
        전체보기
      </button>
    </div>

    <div class="row row-cols-1 row-cols-md-4 g-3 m-0">
      <div
          v-for="product in paginatedProducts"
          :key="product.prodId"
          class="col"
          @click="onClick(product)"
      >
        <div class="card h-100 text-center" style="cursor: pointer;">
          <img
              :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
              class="card-img-top"
              alt="썸네일"
              style="height: 60%; object-fit: cover;"
          />
          <div class="card-body p-2 mt-2">
            <h6 class="card-title mb-1">
              {{ product.prodName }}
            </h6>
            <p class="card-text text-muted" style="font-size: 0.8rem;">
              {{ product.prodRegion }}
            </p>
            <small class="text-muted">
              {{ product.createdAt }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
