<script setup>
import { onMounted, ref } from 'vue'
import { useSeaFishingStore } from '@/store/fishing-region-filter/seaFilter.js'

const store = useSeaFishingStore()

onMounted(async () => {
  await store.fetchProducts()
})
</script>

<template>
  <div class="sea">
    <h2>바다낚시 테스트</h2>
  </div>
  <SeaFilter :filteredProducts="store.products" />
</template>

<style scoped>
.sea {
  width: 80%;
  margin: 5% auto;
}
</style>