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
  <div class="product-list-container">
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
.product-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 64px);
  background: linear-gradient(to bottom, #e3f2fd, #bbdefb);
}

@media (max-width: 768px) {
  .product-list-container {
    padding: 1rem 0.5rem;
  }
}
</style>