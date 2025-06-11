<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductDetailStore } from '@/store/product/product-detail/productDetailStore.js'
import ProductInfo from '@/views/product/product-detail/components/ProductInfo.vue'

const route = useRoute()
const store = useProductDetailStore()

onMounted(() => {
  store.fetchProductDetail(productId)
})

onUnmounted(() => {
  store.clearProduct()
})
</script>

<template>
  <div class="center">
    <div v-if="store.loading">상품 정보를 불러오는 중입니다...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <ProductInfo v-else :product="store.product" />
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  max-width: 800px;
}
</style>
