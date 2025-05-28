<script>
import FishingReport from '@/components/fishing-center/FishingReport.vue'
import FishingDiary from '@/components/fishing-center/FishingDiary.vue'
import Product from "@/views/Product.vue";

export default {
  name: 'FishingCenter',
  components: {
    FishingReport,
    FishingDiary,
    Product,
  }
}

</script>

<template>
  <div class="fishing-center">
    <FishingReport />
    <FishingDiary />
  </div>
</template>