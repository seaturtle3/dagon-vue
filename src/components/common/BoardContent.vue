<script setup>
defineProps({
  content: {
    type: String,
    default: ''
  }
})

</script>

<template>
  <div class="board-content" v-html="content || '내용 없음'"></div>
</template>

<style scoped>
.board-content {
  padding: 1.5rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.8;
  word-break: break-word;
  white-space: pre-wrap;
}
.board-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5rem auto;
}
</style>