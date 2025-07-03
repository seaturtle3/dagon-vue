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
    <div class="fresh-title">
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

.fresh-title {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;
}
.fresh-title h4 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  padding: 0.5em 2em;
}

.filter-detail-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 100px;
}
</style>