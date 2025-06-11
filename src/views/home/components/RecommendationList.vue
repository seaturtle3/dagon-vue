<script setup>
import { onMounted, computed } from 'vue'
import { useProductListStore } from '@/store/product/all-products/productListStore.js'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const store = useProductListStore()

onMounted(async () => {
  await store.fetchProducts()
})

const recommendedProducts = computed(() => {
  return store.products
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)) // 최신순
      .slice(0, 6) // 상위 6개만
})

function openDetail(productId) {
  const url = `/products/product-detail/${productId}`
  window.open(url, '_blank')
}
</script>

<template>
  <div style="margin-top: 5%">
    <h2 class="fw-bold fs-5 mb-4">추천 선사</h2>
    <div class="d-grid" style="grid-template-columns: repeat(6, 1fr); gap: 1rem;">
      <div
          v-for="product in recommendedProducts"
          :key="product.prodId"
          class="cursor border text-center d-flex flex-column"
          style="min-height: 300px;"
          @click="openDetail(product.prodId)"
      >
        <img
            :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
            alt="썸네일"
            class="img-fluid mb-2"
            style="object-fit: cover;"
        />
        <div class="fw-semibold">{{ product.prodName }}</div>
        <div class="text-secondary small mt-2">{{ product.prodAddress }}</div>
      </div>
    </div>
  </div>
</template>

<style>
.cursor {
  cursor: pointer;
}
</style>
