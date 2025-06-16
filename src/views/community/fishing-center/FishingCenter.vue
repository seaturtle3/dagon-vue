<script setup>
import {onMounted} from 'vue'
import {useFishingCenterStore} from '@/store/fishing-center/useFishingCenterStore.js'
import FishingCenterList from './components/FishingCenterList.vue'

const store = useFishingCenterStore()

onMounted(async () => {
  store.fetchFishingCenterData()
})

</script>

<template>
  <div class="center">
    <div v-if="store.isLoading">로딩 중...</div>
    <div v-else>
      <FishingCenterList :centers="[{ reports: store.reportList, diaries: store.diaryList }]" />
    </div>
  </div>
</template>

<style>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>