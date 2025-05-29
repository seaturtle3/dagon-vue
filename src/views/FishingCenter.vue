<script>
import FishingReport from '@/components/fishing-center/FishingReport.vue'
import FishingDiary from '@/components/fishing-center/FishingDiary.vue'
import FishingCenterProducts from '@/components/fishing-center/FishingCenterProducts.vue'

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