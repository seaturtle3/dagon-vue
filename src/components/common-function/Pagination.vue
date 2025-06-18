<script setup>
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
</script>

<template>
  <div class="d-flex justify-content-center mt-4">
    <button
        class="btn btn-outline-secondary mx-1"
        :disabled="(zeroBased ? page === 0 : page === 1)"
        @click="goToPage(page - 1)"
    >
      이전
    </button>

    <button
        v-for="pageNum in totalPages"
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
        :disabled="(zeroBased ? page >= totalPages - 1 : page >= totalPages)"
        @click="goToPage(page + 1)"
    >
      다음
    </button>
  </div>
</template>