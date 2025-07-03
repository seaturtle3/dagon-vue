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
  <div class="main">
    <ProductFormView
        :form="formStore.form"
        :regions="enumStore.regions"
        :mainTypes="enumStore.mainTypes"
        :subTypes="enumStore.subTypes"
    />
  </div>
</template>


<style>
.main {
  width: 80%;
  margin: 5% auto;
}
</style>