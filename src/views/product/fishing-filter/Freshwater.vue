<script setup>
import {onMounted, ref} from 'vue'
import {useFreshwaterProdStore} from '@/store/product/fishing-filter/useFreshwaterProdStore.js'
import FreshwaterProd from "@/views/product/fishing-filter/components/FreshwaterProd.vue"

const store = useFreshwaterProdStore()

onMounted(async () => {
  await store.fetchProducts()
})
</script>

<template>
  <div class="fresh">
    <div style="margin-bottom: 3%">
      <h4>민물낚시</h4>
    </div>
    <FreshwaterProd :filteredProducts="store.products"/>
  </div>
</template>

<style scoped>
.fresh {
  width: 80%;
  margin: 5% auto;
}
</style>