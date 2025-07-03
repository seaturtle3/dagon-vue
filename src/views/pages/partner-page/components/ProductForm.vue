<script setup>
import {onMounted} from 'vue'
import {useRoute} from 'vue-router'
import ProductFormView from '@/views/pages/partner-page/components/ProductFormView.vue'
import {useProductFormStore} from '@/store/product/all-products/useProductFormStore.js'
import {useProductEnumStore} from '@/store/product/all-products/useProductEnumStore.js'

const formStore = useProductFormStore()
const enumStore = useProductEnumStore()
const route = useRoute()

onMounted(async () => {
  await enumStore.loadEnums()
})

const prodId = route.params.id
const editMode = !!prodId
</script>

<template>
  <div class="main">
    <ProductFormView
        :form="formStore.form"
        :regions="enumStore.regions"
        :mainTypes="enumStore.mainTypes"
        :subTypes="enumStore.subTypes"
        :editMode="editMode"
        :prodId="prodId"
    />
  </div>
</template>


<style>
.main {
  width: 80%;
  margin: 5% auto;
}
</style>