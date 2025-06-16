<script setup>
const props = defineProps({
  diaries: {
    type: Array,
    required: false,
    default: () => []
  }
})
</script>

<template>
  <div class="grid-container">
    <div
        class="diary-card"
        v-for="diary in diaries.slice(0, 18)"
        :key="diary.id"
    >
      <h3>제목: {{ diary.title }}</h3>
      <p>내용: {{ diary.content }}</p>
      <p>날짜: {{ diary.fishingAt || '날짜 없음' }}</p>
      <p>상품명: {{ diary.product?.prodName }}</p>
      <p>작성자: {{ diary.user?.uname }}</p>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: 16px;
  margin-top: 20px;
}

.diary-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  background-color: #f9f9f9;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
