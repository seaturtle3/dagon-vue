<script setup>
import {ref, onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";
import {fetchNoticeById, deleteNotice} from "@/api/noticeApi.js";
import {useAdminAuthStore} from "@/store/auth/auth.js";

import BoardDetailBox from "@/components/common/BoardDetailBox.vue";
import BoardContent from "@/components/common/BoardContent.vue";
import BoardDetailAction from "@/components/common/BoardDetailAction.vue";

const route =useRoute()
const router = useRouter()
const authStore = useAdminAuthStore()

const notice = ref(null)
const isAdmin = ref(false)

onMounted(async ()=>{
  authStore.loadTokenFromStorage()
  isAdmin.value = !authStore.token

  const {data} = await fetchNoticeById(route.params.id)
  notice.value = data
})

const handleEdit = ()=>{
  router.push(`/notice/edit/${route.params.id}`)
}

const handleDelete = async ()=>{
  if(!confirm('정말 삭제하시겠습니까?')) return
  await deleteNotice(route.params.id)
  router.push('/notice')
}

</script>

<template>
  <div v-if="notice" class="notice-detail">
    <BoardDetailBox :title="notice.title" :createdAt="notice.createdAt" :views="notice.views" />
    <BoardContent :content="notice.content" />
    <BoardDetailAction v-if="isAdmin" @edit="handleEdit" @delete="handleDelete" />
  </div>
</template>

<style scoped>
.notice-detail {
  width: 80%;
  margin: 5% auto;
}
</style>