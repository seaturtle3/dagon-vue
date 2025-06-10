// ProductInfo.vue
<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js"

defineProps({
  product: Object
})
</script>

<template>
  <div class="detail">
    <div v-if="product">
      <h1 style="margin-bottom: 5%">{{ product.prodName }}</h1>
      <img
          :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
          class="card-img-top"
          alt="썸네일"
          style="width: 100%; height: auto; object-fit: cover; border-radius: 8px;"
      />
      <p>지역: {{ product.prodRegion }}</p>
      <p>등록일: {{ new Date(product.createdAt).toLocaleDateString() }}</p>
    </div>
    <div v-else>
      <p>상품 정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<style scoped>
.detail {
  padding: 16px;
}
</style>
