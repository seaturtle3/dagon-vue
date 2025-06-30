<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['edit', 'delete'])

const isAdmin = ref(false)
const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const adminRoles = ['ADMIN', 'SUPER_ADMIN']
      isAdmin.value = adminRoles.includes(payload.role)
    } catch (e) {
      isAdmin.value = false
    }
  }
})

const handleEdit = () => emit('edit')
const handleDelete = () => emit('delete')
const handleBack = () => router.back()

</script>

<template>
  <div class="detail-action text-end mt-3">
    <!-- 관리자일 경우에만 수정/삭제 -->
    <template v-if="isAdmin">
      <button class="btn btn-outline-primary me-2" @click="handleEdit">수정</button>
      <button class="btn btn-outline-danger me-2" @click="handleDelete">삭제</button>
    </template>

    <!-- 항상 보이는 뒤로가기 -->
    <button class="btn btn-outline-secondary" @click="handleBack">목록</button>
  </div>
</template>

<style scoped>
.detail-action button {
  min-width: 80px;
 text-align: center;
}
</style>