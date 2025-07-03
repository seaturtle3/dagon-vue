<script setup>
import {onMounted, reactive} from 'vue'
import { useRoute } from 'vue-router'
import ProductFormView from '@/views/product/all-products/components/ProductFormView.vue'
import {useProductFormStore} from '@/store/product/all-products/useProductFormStore.js'
import {useProductEnumStore} from '@/store/product/all-products/useProductEnumStore.js'

const route = useRoute()
const formStore = useProductFormStore()
const enumStore = useProductEnumStore()

onMounted(async () => {
  await enumStore.loadEnums()
  formStore.resetForm() // ← 이거 중요!
})
</script>

<template>
  <div class="product-form-container">
    <ProductFormView
        :form="formStore.form"
        :regions="enumStore.regions"
        :mainTypes="enumStore.mainTypes"
        :subTypes="enumStore.subTypes"
    />
  </div>
</template>

<style scoped>
.product-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 64px);
  background: linear-gradient(to bottom, #e3f2fd, #bbdefb);
}

@media (max-width: 768px) {
  .product-form-container {
    padding: 1rem 0.5rem;
  }
}
</style>