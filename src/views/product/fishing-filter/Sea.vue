<script setup>
import { onMounted, ref } from 'vue'
import { useSeaFishingStore } from '@/store/product/fishing-filter/useSeaFilterStore.js'
import SeaFilter from "@/views/product/fishing-filter/components/SeaFilter.vue";
import SeaFilterDetail from "@/views/product/fishing-filter/components/SeaFilterDetail.vue";

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

    <div class="filter-detail-wrapper">
      <SeaFilterDetail @update:filters="onFiltersChanged" />
    </div>

    <SeaFilter :filteredProducts="store.products" />
  </div>
</template>

<style scoped>
.sea {
  width: 80%;
  margin: 5% auto;
}

.filter-detail-wrapper {
  display: flex;
  justify-content: center; /* 수평 중앙 정렬 */
  margin-bottom: 5rem; /* 아래쪽 여백 */
}
</style>