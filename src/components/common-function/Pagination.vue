<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: Number,
  totalPages: Number,
  zeroBased: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['page-change'])

function goToPage(num) {
  emit('page-change', num)
}

// 10개 단위로 페이징 그룹 계산
const maxButtons = 10
const currentPage = computed(() => props.zeroBased ? props.page : props.page - 1)
const totalPages = computed(() => props.totalPages)
const currentGroup = computed(() => Math.floor(currentPage.value / maxButtons))
const startPage = computed(() => currentGroup.value * maxButtons + 1)
const endPage = computed(() => Math.min(startPage.value + maxButtons - 1, totalPages.value))
const pageNumbers = computed(() => {
  const arr = []
  for (let i = startPage.value; i <= endPage.value; i++) {
    arr.push(i)
  }
  return arr
})

function goToPrevGroup() {
  if (startPage.value > 1) {
    goToPage(props.zeroBased ? startPage.value - maxButtons - 1 : startPage.value - maxButtons)
  }
}
function goToNextGroup() {
  if (endPage.value < totalPages.value) {
    goToPage(props.zeroBased ? endPage.value : endPage.value + 1)
  }
}
</script>

<template>
  <div class="pagination">
    <button
      class="arrow-btn"
      :disabled="startPage === 1"
      @click="goToPrevGroup"
    >
      <span aria-hidden="true">&lt;</span>
    </button>

    <button
      v-for="pageNum in pageNumbers"
      :key="pageNum"
      :class="['page-btn', (zeroBased ? page === (pageNum - 1) : page === pageNum) ? 'active' : '']"
      @click="goToPage(zeroBased ? pageNum - 1 : pageNum)"
    >
      {{ pageNum }}
    </button>

    <button
      class="arrow-btn"
      :disabled="endPage === totalPages"
      @click="goToNextGroup"
    >
      <span aria-hidden="true">&gt;</span>
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}
.page-btn {
  background: transparent;
  color: #222;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn.active,
.page-btn:focus {
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}
.page-btn:hover:not(.active):not(:disabled) {
  background: #f3f4f6;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.arrow-btn {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  color: #2563eb;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: border-color 0.18s;
}
.arrow-btn:hover:not(:disabled) {
  border-color: #2563eb;
}
.arrow-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>