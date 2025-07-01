<script setup>
import DiaryCard from './DiaryCard.vue'
import Pagination from '@/components/common-function/Pagination.vue'

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
  <Pagination
    :page="page"
    :totalPages="totalPages"
    :zeroBased="true"
    @page-change="onPageChange"
  />
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-top: 20px;
}
</style>
