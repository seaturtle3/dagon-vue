<script setup>
defineProps({
  page: Number,
  totalPages: Number,
})

defineEmits(['change'])
</script>

<template>
  <div class="pagination-wrap">
    <button :disabled="page === 0" @click="$emit('change', page - 1)">이전</button>
    <button
        v-for="p in totalPages"
        :key="p"
        :class="{ 'page-link': true, active: p - 1 === page }"
        @click="$emit('change', p - 1)">
      {{ p }}
    </button>
    <button :disabled="page >= totalPages - 1" @click="$emit('change', page + 1)">다음</button>
  </div>
</template>

<style scoped>
.pagination-wrap {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}

button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

button.active {
  background-color: #333;
  color: white;
  font-weight: bold;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>