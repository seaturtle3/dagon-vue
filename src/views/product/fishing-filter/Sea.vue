<script setup>
import { onMounted, ref } from 'vue'
import { useSeaFishingStore } from '@/store/product/fishing-filter/useSeaFilterStore.js'
import SeaFilter from "@/views/product/fishing-filter/components/SeaFilter.vue";

const store = useSeaFishingStore()

onMounted(async () => {
  await store.fetchProducts()
})
</script>

<template>
  <div class="sea">
    <div style="margin-bottom: 3%">
      <h4>바다낚시</h4>
    </div>
    <SeaFilter :filteredProducts="store.products" />
  </div>
</template>

<style scoped>
.sea {
  width: 80%;
  margin: 5% auto;
}
</style>