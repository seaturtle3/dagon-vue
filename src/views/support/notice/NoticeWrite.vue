<script setup>
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import BoardWriteForm from "@/components/common/BoardWriteForm.vue";
import {fetchNoticeById, createNotice, updateNotice} from "@/api/noticeApi.js";

const router = useRouter()
const route = useRoute()

const isEdit = !!route.params.id

const form = ref({
  title: '',
  content: '',
  isTop: false
})

onMounted(async () => {
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
  if (isEdit) {
    await updateNotice(route.params.id, form.value)
  } else {
    await createNotice(form.value)
  }
  router.push('/notice')
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