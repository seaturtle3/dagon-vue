<template>
  <div>
    <div v-for="inquiry in inquiries" :key="inquiry.id" class="catch-item">
      <div class="catch-info">
        <div class="catch-title">{{ inquiry.title }}</div>
        <div class="catch-desc">{{ inquiry.content }}</div>
        <div class="catch-meta">
          <span>작성자: {{ inquiry.writer }}</span>
          <span>유형: {{ inquiry.writerType }}</span>
        </div>
      </div>
      <button @click="$emit('edit', inquiry)">수정</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  inquiries: Array
})
</script>

<style scoped>
.catch-item {
  background-color: white;
  display: flex;
  justify-content: space-between;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>