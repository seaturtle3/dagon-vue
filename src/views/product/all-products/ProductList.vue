<!-- ProductList.vue -->
<script setup>
import { onMounted } from 'vue'
import ProductListView from '@/views/product/all-products/components/ProductListView.vue'
import { useProductEnumStore } from '@/store/product/all-products/useProductEnumStore.js'
import { useProductListStore } from '@/store/product/all-products/useProductListStore.js'

const enumStore = useProductEnumStore()
const listStore = useProductListStore()

onMounted(() => {
  listStore.fetchProducts()
  enumStore.loadEnums()
})
</script>

<template>
  <div class="main">
    <!-- ProductListView -->
    <ProductListView
        :products="listStore.products"
        :page="listStore.page"
        :total-pages="listStore.totalPages"
        @page-change="listStore.goToPage"
    />
  </div>
</template>

<style scoped>
.main {
  width: 80%;
  margin: 5% auto;
}
</style>