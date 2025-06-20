<script setup>
defineEmits(['submit', 'cancel'])
</script>

<template>
  <form @submit.prevent="$emit('submit')">
    <slot name="fields" />
    <div class="text-end mt-3">
      <button type="submit" class="btn btn-custom">저장</button>
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">취소</button>
    </div>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
}

button {
  padding: 8px 16px;
  background: #333;
  color: white;
  border: none;
  cursor: pointer;
}
</style>