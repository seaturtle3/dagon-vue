<template>
  <div class="form-wrapper">
    <form class="inquiry-form" @submit.prevent="submit">
      <label>작성자 유형</label>
      <select v-model="form.writerType" required>
        <option disabled value="">작성자 유형</option>
        <option v-for="type in writerTypes" :key="type.value" :value="type.value">
          {{ type.label }}
        </option>
      </select>

      <label>문의 유형</label>
      <select v-model="form.inquiryType" required>
        <option disabled value="">문의 유형</option>
        <option v-for="type in inquiryTypes" :key="type.value" :value="type.value">
          {{ type.label }}
        </option>
      </select>

      <label>작성자</label>
      <input type="text" v-model="form.writer" required />

      <label>연락처</label>
      <input type="text" v-model="form.contact" required />

      <label>제목</label>
      <input type="text" v-model="form.title" required />

      <label>내용</label>
      <textarea v-model="form.content" required></textarea>

      <button type="submit">제출</button>
    </form>
  </div>
</template>

<script setup>
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

<style scoped>
.form-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #eef6fb;
  padding: 20px;
}

.inquiry-form {
  width: 100%;
  max-width: 600px;
  background-color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 100, 200, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Noto Sans KR', sans-serif;
}

label {
  font-weight: 600;
  color: #333;
  margin-top: 10px;
}

select,
input,
textarea {
  padding: 10px 12px;
  border: 1px solid #cce4f6;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

select:focus,
input:focus,
textarea:focus {
  border-color: skyblue;
  outline: none;
  box-shadow: 0 0 5px rgba(135, 206, 250, 0.5);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

button[type="submit"] {
  margin-top: 20px;
  background-color: skyblue;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

button[type="submit"]:hover {
  background-color: #45b4e7;
}
</style>