<script setup>
import {onMounted, ref} from 'vue'
import {useFreshwaterFishingStore} from '@/store/product/fishing-filter/useFreshwaterFilterStore.js'
import FreshwaterFilter from "@/views/product/fishing-filter/components/FreshwaterFilter.vue"

const store = useFreshwaterFishingStore()

onMounted(async () => {
  await store.fetchProducts()
})
</script>

<template>
  <div class="fresh">
    <div style="margin-bottom: 3%">
      <h4>민물낚시</h4>
    </div>
    <FreshwaterFilter :filteredProducts="store.products"/>
  </div>
</template>

<style scoped>
.fresh {
  width: 80%;
  margin: 5% auto;
}
</style>