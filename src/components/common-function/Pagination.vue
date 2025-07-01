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
  <div class="d-flex justify-content-center mt-5">
    <button
      class="btn btn-outline-secondary mx-1"
      :disabled="startPage === 1"
      @click="goToPrevGroup"
    >
      이전
    </button>

    <button
      v-for="pageNum in pageNumbers"
      :key="pageNum"
      class="btn mx-1"
      :class="(zeroBased ? page === (pageNum - 1) : page === pageNum)
        ? 'btn-primary'
        : 'btn-outline-primary'"
      @click="goToPage(zeroBased ? pageNum - 1 : pageNum)"
    >
      {{ pageNum }}
    </button>

    <button
      class="btn btn-outline-secondary mx-1"
      :disabled="endPage === totalPages"
      @click="goToNextGroup"
    >
      다음
    </button>
  </div>
</template>