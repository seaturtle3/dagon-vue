<script>
import FishingReport from '@/components/fishing-center/FishingReport.vue'
import FishingDiary from '@/components/fishing-center/FishingDiary.vue'
import ProductGrid from '@/components/fishing-center/ProductGrid.vue'

export default {
  name: 'FishingCenter',
  components: {
    FishingReport,
    FishingDiary,
    ProductGrid
  }
}

</script>

<template>
  <div class="fishing-center">
    <ProductGrid />
  </div>
</template>