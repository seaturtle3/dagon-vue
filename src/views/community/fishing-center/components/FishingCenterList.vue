<script setup>
import { IMAGE_BASE_URL } from '@/constants/imageBaseUrl'

console.log(IMAGE_BASE_URL);

defineProps({
  products: Array
})

function onClick(product) {
  const url = `/products/${product.prodId}`
  window.open(url, '_blank')  // 새 탭에서 열기
}

</script>

<template>
  <div class="row row-cols-1 row-cols-md-5 g-3">
    <div
        v-for="product in products"
        :key="product.prodId"
        class="col"
    >
      <div
          class="card h-100"
          style="cursor: pointer;"
          @click="onClick(product)"
      >
        <img
            :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
            class="card-img-top"
            alt="썸네일"
            style="height: 60%; object-fit: cover;"
        />
        <div class="card-body p-2 mt-2">
          <h6 class="card-title mb-1">
            {{ product.prodName }}</h6>
          <p class="card-text text-muted" style="font-size: 0.8rem;">
            {{ product.prodRegion }}
          </p>
          <small class="text-muted">
            {{ product.createdAt }}</small>
        </div>
      </div>
    </div>
  </div>
</template>
