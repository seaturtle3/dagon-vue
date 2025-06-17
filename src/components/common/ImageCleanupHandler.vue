<script setup>
import { onBeforeUnmount } from 'vue'
import axios from '@/lib/axios'

const props = defineProps({
  uploadedImages: {
    type: Array,
    required: true
  },
  contentHtml: {
    type: String,
    required: true
  },
  boardType: {
    type: String,
    required: true
  }
})

onBeforeUnmount(() => {
  if (props.uploadedImages.length === 0) return

  axios.post('/api/images/cleanup-unused', {
    boardType: props.boardType,
    uploadedImages: props.uploadedImages,
    contentHtml: props.contentHtml
  }).catch(err => {
    console.error('이미지 정리 실패:', err)
  })
})

</script>

<template>

</template>

<style scoped>

</style>