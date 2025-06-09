<script>
import { onMounted, ref } from 'vue'
import { useFreshwaterFishingStore } from '@/store/fishing-region-filter/freshwaterFilterStore.js'
import FreshwaterFilter from "@/views/fishing-filter/components/FreshwaterFilter.vue";

const store = useFreshwaterFishingStore

onMounted(async () => {
  await store.fetchProducts()
})
</script>

<template>
  <div class="fresh">
    <h2>민물낚시</h2>
  </div>

  <FreshwaterFilter :filteredProducts="store.products" />

</template>

<style scoped>
.fresh {
  width: 80%;
  margin: 5% auto;
}
</style>