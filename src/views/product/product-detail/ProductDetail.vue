<script setup>
import {computed, onMounted, onUnmounted} from 'vue'
import { useRoute } from 'vue-router'
import { useProductDetailStore } from '@/store/product/product-detail/productDetailStore.js'
import ProductInfo from '@/views/product/product-detail/components/ProductInfo.vue'

const route = useRoute()
const productId = route.params.id
const store = useProductDetailStore()
const product = computed(() => store.product)

onMounted(() => {
  store.fetchProductDetail(productId)
  console.log('ProductDetail prodId: ', productId)
})

onUnmounted(() => {
  store.clearProduct()
})
</script>

<template>
  <div class="center">
    <ProductInfo v-if="product" :product="product" />
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  max-width: 800px;
}
</style>
