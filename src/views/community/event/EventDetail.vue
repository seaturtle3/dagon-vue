<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/axios'
import {useAdminAuthStore} from "@/store/auth/auth.js";

import BoardDetailBox from "@/components/common/BoardDetailBox.vue";
import BoardDetailAction from "@/components/common/BoardDetailAction.vue";

const route = useRoute()
const router = useRouter()
const authStore = useAdminAuthStore()

const event = ref(null)
const isAdmin = ref(false)

onMounted(async () => {
  authStore.loadTokenFromStorage()
  isAdmin.value = !!authStore.token

  const res = await api.get(`/event/${route.params.id}`)
  event.value = res.data
})

const handleEdit = () => {
  router.push(`/event/edit/${route.params.id}`)
}

const handleDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  await api.delete(`/admin/event/${route.params.id}`, {
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  })
  router.push('/event')
}
</script>

<template>
  <div v-if="event" class="board-detail">
    <BoardDetailBox>
      <template #title>
        <div class="d-flex justify-between align-items-center">
          <span>{{ event.title }}</span>
          <span class="badge bg-success ms-2">{{ event.eventStatus }}</span>
        </div>
      </template>

      <template #info>
        <div class="text-muted small">
          {{ event.startAt }} ~ {{ event.endAt }}
        </div>
      </template>

      <template #default>
        <hr class="board-divider" />
        <div v-html="event.content" class="mt-4" />
      </template>
    </BoardDetailBox>

    <BoardDetailAction @edit="handleEdit" @delete="handleDelete" />
  </div>
</template>

<style scoped>
.board-detail {
  width: 80%;
  margin: 5% auto;
}

hr.board-divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 1rem 0;
}
</style>