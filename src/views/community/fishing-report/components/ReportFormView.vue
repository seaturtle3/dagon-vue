<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  dto: Object,
  images: Array,
  loading: Boolean,
  error: String,
})

const emits = defineEmits(['file-change', 'submit'])
</script>

<template>
  <form @submit.prevent="emits('submit')">
    <div>
      <label>제목</label>
      <input v-model="props.dto.title" type="text" required />
    </div>
    <div>
      <label>내용</label>
      <textarea v-model="props.dto.content" required></textarea>
    </div>
    <div>
      <label>위치</label>
      <input v-model="props.dto.location" type="text" />
    </div>
    <div>
      <label>이미지 업로드</label>
      <input type="file" multiple @change="e => emits('file-change', e)" />
    </div>
    <div v-if="props.error" style="color: red;">{{ props.error }}</div>
    <button type="submit" :disabled="props.loading">
      {{ props.loading ? '저장중...' : '등록' }}
    </button>
  </form>
</template>
