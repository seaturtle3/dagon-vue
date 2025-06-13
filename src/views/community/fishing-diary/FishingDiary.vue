<script setup>
import { onMounted } from 'vue'
import { useFishingDiaryStore } from "@/store/fishing-center/useFishingDiaryStore.js";
import {defineComponent} from "vue";
import FishingDiaryList from "@/views/community/fishing-diary/components/FishingDiaryList.vue";

const store = useFishingDiaryStore()

onMounted(() => {
  store.fetchDiaries()
  console.log('-------------FishingDiary : ', store.diaries)
})
</script>

<template>
  <div class="center">
    <h1>조행기</h1>
    <FishingDiaryList v-if="store.diaries.length" :diaries="store.diaries" />
    <p v-else>조황 정보를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>