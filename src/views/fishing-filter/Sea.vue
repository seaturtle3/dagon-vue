<script setup>
import { onMounted, ref } from 'vue'
import { useSeaFishingStore } from '@/store/fishing-region-filter/seaFilterStore.js'
import SeaFilter from "@/views/fishing-filter/components/SeaFilter.vue";

const store = useSeaFishingStore()

onMounted(async () => {
  await store.fetchProducts()
})
</script>

<template>
  <div class="sea">
    <div style="margin-bottom: 3%">
      <h2>바다낚시</h2>
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