<script setup>
import ProductList from '@/views/product/components/ProductList.vue'
import ProductForm from '@/views/product/components/ProductForm.vue'
import { useProductStore } from '@/store/product/productStore.js'
import {onMounted} from "vue";

const productStore = useProductStore()

function onFormSubmit() {
  productStore.toggleForm()
  // 등록 후 리스트 다시 불러오거나 추가 로직
}
onMounted(() => {
  productStore.fetchProducts()
})
</script>

<template>
  <div>
    <!-- 여기서 products 전달 -->
    <ProductList v-if="!productStore.showForm" :products="productStore.products" />

    <!-- 등록 폼 -->
    <ProductForm v-if="productStore.showForm" @submitted="onFormSubmit" />

    <!-- 토글 버튼 -->
    <button @click="productStore.toggleForm" class="btn btn-secondary mt-3">
      {{ productStore.showForm ? '뒤로가기' : '배 등록하기' }}
    </button>
  </div>
</template>
