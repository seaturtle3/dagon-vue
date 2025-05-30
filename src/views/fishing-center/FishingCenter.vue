<script>
import FishingReport from '@/views/fishing-center/components/FishingReport.vue'
import FishingDiary from '@/views/fishing-center/components/FishingDiary.vue'
import FishingCenterProducts from '@/views/fishing-center/components/FishingCenterProducts.vue'

export default {
  name: 'FishingCenter',
  components: {
    FishingReport,
    FishingDiary,
    FishingCenterProducts
  },
}
</script>

<template>
  <div class="fishing-center">
    <FishingCenterProducts />
  </div>
</template>