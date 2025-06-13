<script setup>
import {onMounted} from 'vue'
import {useFishingCenterStore} from '@/store/fishing-center/useFishingCenterStore.js'
import FishingCenterList from './components/FishingCenterList.vue'

const store = useFishingCenterStore()

onMounted(async () => {
  await store.fetchFishingCenters()
  console.log('-----------------fishingCenter :', store.fishingCenters) // 이제 데이터 제대로 찍힘
})

function handleSelect(centers) {

}
</script>

<template>
  <div class="center">
    <div v-if="store.isLoading">로딩 중...</div>
    <div v-else>
      <FishingCenterList :centers="store.fishingCenters"/>
    </div>
  </div>
</template>

<style>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>