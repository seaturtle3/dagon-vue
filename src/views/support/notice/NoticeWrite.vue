<script setup>
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import BoardWriteForm from "@/components/common/BoardWriteForm.vue";
import {fetchNoticeById, createNotice, updateNotice} from "@/api/noticeApi.js";
import { useAdminAuthStore} from "@/store/auth/auth.js";

const router = useRouter()
const route = useRoute()
const authStore = useAdminAuthStore()

const isEdit = !!route.params.id

const form = ref({
  title: '',
  content: '',
  isTop: false
})

onMounted(async () => {
  authStore.loadTokenFromStorage()

  if (isEdit) {
    const { data } = await fetchNoticeById(route.params.id)
    form.value = {
      title: data.title,
      content: data.content,
      isTop: data.isTop
    }
  }
})

const handleSubmit = async () => {
  if (!authStore.token) {
    alert('관리자 로그인이 필요합니다.')
    return
  }

  try {
    if (isEdit) {
      await updateNotice(route.params.id, form.value, authStore.token)
    } else {
      await createNotice(form.value, authStore.token) // ✅ 토큰 포함
    }
    router.push('/notice')
  } catch (error) {
    console.error('공지사항 저장 오류:', error)
  }
}
</script>

<template>

  <div class="notice-write center">
    <h2>{{ isEdit ? '공지사항 수정' : '공지사항 등록' }}</h2>
    <BoardWriteForm v-model="form" :showTopOption="true" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>