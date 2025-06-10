<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductListStore } from '@/store/product/all-products/productListStore.js'
import ProductInfo from '@/views/product/product-detail/components/ProductInfo.vue'

const route = useRoute()
const store = useProductListStore()
const productId = route.params.id

const product = ref(null)

watch(
    () => store.products,
    (products) => {
      if (products.length > 0) {
        product.value = products.find(p => String(p.prodId) === productId)
        console.log('찾은 product:', product.value)
      }
    },
    { immediate: true }
)

console.log('route.params.id:', route.params.id)
</script>

<template>
  <div class="center">
    <div v-if="!product">상품 정보를 불러오는 중입니다...</div>
    <ProductInfo v-else :product="product" />
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  max-width: 800px;
}
</style>
