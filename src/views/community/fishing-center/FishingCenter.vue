<script setup>
import { onMounted } from 'vue'
import { useFishingCenterStore } from '@/store/fishing-center/fishingCenterStore.js'
import FishingCenterProducts from './components/FishingCenterProducts.vue'
import router from "@/router/index.js";

const store = useFishingCenterStore()

onMounted(() => {
  store.fetchProducts()
})

function handleSelect(product) {
  console.log('선택된 상품:', product)
  router.push({ name: 'ProductDetail', params: { id: product.prodId } })
}
</script>

<template>
  <div class="center">
    <FishingCenterProducts :products="store.products" @select="handleSelect" />
  </div>
</template>

<style>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>