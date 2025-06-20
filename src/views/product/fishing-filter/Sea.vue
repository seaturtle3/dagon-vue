<script setup>
import {computed, onMounted, ref} from 'vue'
import { useSeaProdStore } from '@/store/product/fishing-filter/useSeaProdStore.js'
import SeaProd from "@/views/product/fishing-filter/components/SeaProd.vue";
import SeaFilter from "@/views/product/fishing-filter/components/SeaFilter.vue";

const store = useSeaProdStore()

onMounted(async () => {
  await store.fetchProducts()
})

const productStore = useSeaProdStore()
const products = computed(() => productStore.products)

const onFilterChange = async ({ region }) => {
  await productStore.fetchFilteredProducts({ region })
}
</script>

<template>
  <div class="sea">
    <div style="margin-bottom: 3%">
      <h4>바다낚시</h4>
    </div>

    <div class="filter-detail-wrapper">
      <SeaFilter @update:filters="onFilterChange" />
    </div>

    <SeaProd :seaProducts="products"/>

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