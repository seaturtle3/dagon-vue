<script setup>
const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div>
    <h1>{{ report.title }}</h1>
    <img :src="`/images/fishing-report/${report.thumbnailUrl}`" alt="썸네일" />
    <p>작성자: {{ report.user?.uname }}</p>
    <p>날짜: {{ report.fishingAt }}</p>
    <p>{{ report.content }}</p>
  </div>
</template>
