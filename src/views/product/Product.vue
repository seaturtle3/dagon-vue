<script setup>
import ProductList from '@/views/product/components/ProductList.vue'
import ProductForm from '@/views/product/components/ProductForm.vue'

import { useProductEnumStore } from '@/store/product/productEnumStore.js'
import { useProductListStore } from '@/store/product/productListStore.js'
import { useProductFormStore } from '@/store/product/productFormStore.js'

import { onMounted } from 'vue'

// 각각 스토어 가져오기
const enumStore = useProductEnumStore()
const listStore = useProductListStore()
const formStore = useProductFormStore()

function onFormSubmit() {
  formStore.toggleForm()
  // 등록 후 리스트 다시 불러오기 등 로직 가능
}

onMounted(() => {
  listStore.fetchProducts()
  enumStore.loadEnums()

  console.log('productEnumStore:', enumStore.loadEnums())
  enumStore.loadEnums()
})
</script>

<template>

    <!-- ProductList -->
    <ProductList
        v-if="!formStore.showForm"
        :products="listStore.products"
        :page="listStore.page"
        :total-pages="listStore.totalPages"
        @page-change="listStore.goToPage"
    />

    <!-- ProductForm -->
    <ProductForm
        v-if="formStore.showForm"
        :form="formStore.form"
        :regions="enumStore.regions"
        :mainTypes="enumStore.mainTypes"
        :subTypes="enumStore.subTypes"
        @submit="onFormSubmit"
    />

    <!-- 토글 버튼 -->
    <button @click="formStore.toggleForm" class="btn btn-secondary mt-3">
      {{ formStore.showForm ? '뒤로가기' : '배 등록하기' }}
    </button>

</template>
