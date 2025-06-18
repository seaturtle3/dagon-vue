<script setup>
const props = defineProps({
  number: [String, Number],
  title: String,
  date: String
})
const emit = defineEmits(['click'])
</script>

<template>
  <div class="row py-2 border-bottom list-item" @click="$emit('click')">
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