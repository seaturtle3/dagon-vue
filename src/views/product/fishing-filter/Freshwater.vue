<script setup>
import {computed, onMounted, ref} from 'vue'
import {useFreshwaterProdStore} from '@/store/product/fishing-filter/useFreshwaterProdStore.js'
import FreshwaterProd from "@/views/product/fishing-filter/components/FreshwaterProd.vue"
import FreshwaterFilter from "@/views/product/fishing-filter/components/FreshwaterFilter.vue";

const store = useFreshwaterProdStore()

onMounted(async () => {
  await store.fetchProducts()
})

const productStore = useFreshwaterProdStore()
const products = computed(() => productStore.products)

const onFilterChange = async (filter) => {
  await productStore.fetchFilteredProducts(filter)
}
</script>

<template>
  <div class="fresh">
    <div style="margin-bottom: 3%">
      <h4>민물낚시</h4>
    </div>

    <div class="filter-detail-wrapper">
      <FreshwaterFilter @update:filter="onFilterChange" />
    </div>

    <FreshwaterProd :filteredProducts="products"/>
  </div>
</template>

<style scoped>
.fresh {
  width: 80%;
  margin: 5% auto;
}

.filter-detail-wrapper {
  display: flex;
  justify-content: center; /* 수평 중앙 정렬 */
  margin-bottom: 5rem; /* 아래쪽 여백 */
}
</style>