<script setup>
defineProps({
  title: String,
  createdAt: String,
  views: Number,
  adminName: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="board-detail-box">
    <h2 class="title">{{ title }}</h2>
    <div class="meta">
      <span>{{ createdAt }}</span>
      <span v-if="adminName">작성자: {{ adminName }}</span>
      <span>조회수: {{ views }}</span>
    </div>
  </div>
</template>

<style scoped>
.board-detail-box {
  padding: 1.5rem;
  background-color: #fdfdfd;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
}
</style>