<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js"

defineProps({
  product: {
    type: Object,
    required: true,
  }
})

// 렌더링 직전 product 값 확인용
console.log('ProductInfo props product:', product)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="detail">
    <div>
      배 상품 상세페이지
    </div>
    <h1 class="title">{{ product.prodName }}</h1>
    <img
        :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
        class="thumbnail"
        alt="썸네일"
    />
    <p>지역: {{ product.prodRegion }}</p>
    <p>등록일: {{ formatDate(product.createdAt) }}</p>
  </div>
</template>

<style scoped>
.detail {
  padding: 16px;
}

.title {
  margin-bottom: 5%;
  font-size: 1.5rem;
  font-weight: bold;
}

.thumbnail {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}
</style>
