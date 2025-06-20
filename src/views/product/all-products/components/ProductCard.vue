<!-- ProductCard.vue -->
<script setup>
import { IMAGE_BASE_URL } from '@/constants/imageBaseUrl.js'

const props = defineProps({
  product: Object,
})

function openDetail(product) {
  const url = `products/${product.prodId}`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="card h-100" @click="openDetail(product)">
    <img
        :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
        class="card-img-top"
        alt="썸네일"
        style="height: 150px; object-fit: cover;"
    />
    <div class="card-body">
      <h6 class="card-title">{{ product.prodName }}</h6>
      <p class="card-text text-muted" style="font-size: 0.8rem">
        {{ product.prodRegion }}
      </p>
      <small class="text-muted">{{ new Date(product.createdAt).toLocaleDateString() }}</small>
    </div>
  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
}
</style>