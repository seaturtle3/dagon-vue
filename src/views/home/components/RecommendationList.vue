<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { IMAGE_BASE_URL } from '@/constants/imageBaseUrl.js'

const props = defineProps({
  products: {
    type: Array,
    required: true
  }
})

const router = useRouter()

function openDetail(productId) {
  router.push(`/products/${productId}`)
}
</script>

<template>
  <div style="margin-top: 5%">
    <h2 class="fw-bold fs-5 mb-4">추천 선사</h2>
    <div class="d-grid" style="grid-template-columns: repeat(6, 1fr); gap: 1rem;">
      <div
          v-for="product in products"
          :key="product.prodId"
          class="cursor border text-center d-flex flex-column"
          style="min-height: 300px;"
          @click="openDetail(product.prodId)"
      >
        <img
            :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
            alt="썸네일"
            class="product-img mb-4"
        />
        <div class="fw-semibold">
          {{ product.prodName }}
        </div>
        <div class="text-secondary small mt-2">
          {{ product.prodAddress }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-img {
  height: 50%;
  width: 100%;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}
.cursor {
  cursor: pointer;
}
</style>
