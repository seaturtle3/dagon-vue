<script setup>
import {ref, onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";
import {fetchNoticeById, deleteNotice} from "@/api/noticeApi.js";
import {useAdminAuthStore} from "@/store/auth/auth.js";

import BoardDetailBox from "@/components/common/BoardDetailBox.vue";
import BoardDetailAction from "@/components/common/BoardDetailAction.vue";

const route = useRoute()
const router = useRouter()
const authStore = useAdminAuthStore()

const notice = ref(null)
const isAdmin = ref(false)

onMounted(async () => {
  authStore.loadTokenFromStorage()
  isAdmin.value = !!authStore.token

  const {data} = await fetchNoticeById(route.params.id)
  notice.value = data
})

const handleEdit = () => {
  router.push(`/notice/edit/${route.params.id}`)
}

const handleDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  await deleteNotice(route.params.id, authStore.token)
  router.push('/notice')
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div v-if="notice" class="board-detail">
    <BoardDetailBox>
      <template #title>
        <div class="d-flex justify-between align-items-center">
          <span>{{ notice.title }}</span>
        </div>
      </template>

      <template #info>
        <div class="text-muted small">
        {{ formatDate(notice.createdAt) }}
          <span class="ms-3 text-secondary">작성자: {{ notice.adminName }}</span>
        </div>

      </template>

      <template #default>
        <hr class="board-divider" />
        <div v-html="notice.content" class="mt-4" />
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

.board-buttons {
  margin-top: 1rem;
  text-align: right;
}

hr.board-divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 1rem 0;
}
</style>