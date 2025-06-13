<script>
import { onMounted } from 'vue'
import { useFishingReportStore } from "@/store/fishing-center/useFishingReportStore.js";

const reportStore = useFishingReportStore()

onMounted(() => {
  reportStore.fetchReports()
})
</script>

<template>
  <div class="fishing-diary">
    <h1>조행기</h1>
    <ul>
      <li v-for="diary in diaryStore.diaries" :key="diary.id">
        {{ diary.title }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
</style>