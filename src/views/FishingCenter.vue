<script>
import FishingReport from '@/components/fishing-center/FishingReport.vue'
import FishingDiary from '@/components/fishing-center/FishingDiary.vue'

export default {
  name: 'FishingCenter',
  components: {
    FishingReport,
    FishingDiary,
  }
}

</script>

<template>
<div class="fishing-center">
  <FishingReport />
  <FishingDiary />
</div>
</template>

<style scoped>
.fishing-center {
  width: 80%;
  margin: auto;
}
</style>