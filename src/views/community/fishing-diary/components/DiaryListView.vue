<script setup>
import DiaryCard from './DiaryCard.vue'

const props = defineProps({
  diaries: {
    type: Array,
    required: true
  },
  page: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  onPageChange: {
    type: Function,
    required: true
  }
})
</script>

<template>
  <div class="grid-container">
    <DiaryCard
        v-for="diary in diaries"
        :key="diary.id || diary.fdId"
        :diary="diary"
    />
  </div>
  <div class="pagination-wrapper">
    <button
      :disabled="page === 0"
      @click="onPageChange(page - 1)">
      이전
    </button>
    <span class="page-info">{{ page + 1 }} / {{ totalPages }}</span>
    <button
      :disabled="page >= totalPages - 1"
      @click="onPageChange(page + 1)">
      다음
    </button>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-top: 20px;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0 0 0;
  gap: 16px;
}
.page-info {
  font-size: 1rem;
  font-weight: 500;
}
button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
