<!-- views/community/fishing-diary/components/DiaryListView.vue -->
<script setup>
import DiaryCard from './DiaryCard.vue'

const props = defineProps({
  diaries: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="grid-container">
    <DiaryCard
        v-for="diary in diaries.slice(0, 18)"
        :key="diary.id"
        :diary="diary"
    />
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-top: 20px;
}
</style>
