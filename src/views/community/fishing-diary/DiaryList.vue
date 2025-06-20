<!-- views/community/fishing-diary/DiaryList.vue -->
<script setup>
import { onMounted } from 'vue'
import { useFishingDiaryStore } from '@/store/fishing-center/useFishingDiaryStore.js'
import DiaryListView from './components/DiaryListView.vue'

const store = useFishingDiaryStore()

onMounted(async () => {
  await store.fetchDiaries()
})
</script>

<template>
  <div class="center">
    <h4>조행기</h4>
    <DiaryListView v-if="store.diaries.length" :diaries="store.diaries" />
    <p v-else>조행기를 불러오는 중입니다...</p>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>
