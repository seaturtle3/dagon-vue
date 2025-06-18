<script setup>
defineProps({
  number: [String, Number],
  title: String,
  date: String,
  onClick: Function
})

const handleClick = () => {
  if (typeof onClick === 'function') onClick()
}
</script>

<template>
  <div class="row py-2 border-bottom list-item" @click="handleClick">
    <div class="col-2 text-center">{{ number }}</div>
    <div class="col text-start">{{ title }}</div>
    <div class="col-3 text-center">{{ date }}</div>
  </div>
</template>

<style scoped>
.list-item {
  cursor: pointer;
}
.list-item:hover {
  background-color: #f8f9fa; /* Bootstrap 기본 hover 톤 */
}
</style>