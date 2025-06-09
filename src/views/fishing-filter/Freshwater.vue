<script setup>
import {onMounted, ref} from 'vue'
import {useFreshwaterFishingStore} from '@/store/fishing-region-filter/freshwaterFilterStore.js'
import FreshwaterFilter from "@/views/fishing-filter/components/FreshwaterFilter.vue"

const store = useFreshwaterFishingStore()

onMounted(async () => {
  await store.fetchProducts()
})
</script>

<template>
  <div class="fresh">
    <div style="margin-bottom: 3%">
      <h2>민물낚시</h2>
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