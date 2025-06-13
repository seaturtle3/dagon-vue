<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: '글쓰기'
  }
})

const isAdmin = ref(false)
const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      isAdmin.value = payload.role === 'ADMIN'
    } catch (e) {
      console.error('JWT 파싱 실패:', e)
      isAdmin.value = false
    }
  } else {
    isAdmin.value = false  // ✅ 토큰 없을 경우 명시적 설정
  }
})

const goToWrite = () => {
  router.push(props.to)
}
</script>

<template>
  <div v-if="isAdmin" class="text-end" style="margin-bottom: 16px;">
    <button @click="goToWrite" class="btn-custom">{{ label }}</button>
  </div>
</template>

<style scoped>
.btn-custom {
  background-color: #333;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-custom:hover {
  background-color: #555;
}
</style>