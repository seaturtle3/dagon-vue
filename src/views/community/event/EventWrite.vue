<script setup>
import BoardWriteButton from "@/components/common/BoardWriteButton.vue";
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id
const isEdit = !!eventId
const form = ref({
  title: '',
  content: '',
  startAt: '',
  endAt: '',
  isTop: false,
  thumbnailUrl: ''
})

onMounted(async () => {
  if (isEdit) {
    const res = await axios.get(`/api/admin/events/${eventId}`)
    form.value = res.data
  }
})

const handleSubmit = async () => {
  if (isEdit) {
    await axios.put(`/api/admin/events/${eventId}`, form.value)
  } else {
    await axios.post('/api/admin/events', form.value)
  }
  router.push('/event')
}

const handleCancel = () => {
  router.push('/event')
}
</script>

<template>
  <BoardWriteForm
      :modelValue="form"
      formAction="이벤트"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @update:modelValue="form = $event"
  >
    <template #fields>
      <div class="mb-3">
        <label class="form-label">이벤트 시작일</label>
        <input v-model="form.startAt" type="date" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">이벤트 종료일</label>
        <input v-model="form.endAt" type="date" class="form-control" />
      </div>
      <div class="mb-3 form-check">
        <input v-model="form.isTop" type="checkbox" class="form-check-input" id="isTop" />
        <label class="form-check-label" for="isTop">상단 고정</label>
      </div>
    </template>
  </BoardWriteForm>
</template>

<style scoped>

</style>