<script setup>
import { onMounted } from 'vue'
import { useFishingCenterStore } from '@/store/fishing-center/fishingCenterStore.js'
import ProductList from './components/FishingCenterProducts.vue'

const store = useFishingCenterStore()

onMounted(() => {
  store.fetchProducts()
})

function handleSelect(product) {
  console.log('선택된 상품:', product)
  // 상세 페이지 이동 등 처리 가능
}
</script>

<template>
  <div class="fishing-center">
    <ProductList :products="store.products" @select="handleSelect" />
  </div>
</template>
