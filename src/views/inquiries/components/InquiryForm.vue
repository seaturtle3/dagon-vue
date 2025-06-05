<template>
  <form @submit.prevent="submit">
    <label>작성자 유형</label>
    <select v-model="form.writerType" required>
      <option disabled value="">작성자 유형</option>
      <option v-for="type in writerTypes" :key="type.value" :value="type.value">
        {{ type.label }}
      </option>
    </select>
    <br />

    <label>문의 유형</label>
    <select v-model="form.inquiryType" required>
      <option disabled value="">문의 유형</option>
      <option v-for="type in inquiryTypes" :key="type.value" :value="type.value">
        {{ type.label }}
      </option>
    </select>
    <br />

    <label>작성자</label>
    <input type="text" v-model="form.writer" required />
    <br />

    <label>연락처</label>
    <input type="text" v-model="form.contact" required />
    <br />

    <label>제목</label>
    <input type="text" v-model="form.title" required />
    <br />

    <label>내용</label>
    <textarea v-model="form.content" required></textarea>
    <br />

    <button type="submit">제출</button>
  </form>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  form: Object,
  writerTypes: Array,
  inquiryTypes: Array
})

const emit = defineEmits(['submit'])

function submit() {
  emit('submit')
}
</script>