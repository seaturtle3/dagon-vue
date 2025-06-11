<script setup>
const props = defineProps({
  search: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['search'])
</script>

<template>
  <div class="search-form">
    <select v-model="search.type">
      <option value="title">제목</option>
      <option value="content">내용</option>
      <option value="title+content">제목+내용</option>
    </select>
    <input v-model="search.keyword" placeholder="검색어 입력" />
    <button @click="emit('search')">검색</button>
  </div>
</template>

<style scoped>
.search-form {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}
.search-form select,
.search-form input {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search-form button {
  padding: 6px 12px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.search-form button:hover {
  background-color: #555;
}
</style>