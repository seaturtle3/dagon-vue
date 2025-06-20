<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import BoardWriteForm from "@/components/common/BoardWriteForm.vue";
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { useAdminAuthStore} from "@/store/auth/auth.js";

const router = useRouter()
const route = useRoute()
const noticeId = route.params.id

const isEdit = !!noticeId

const form = reactive({
  title: '',
  content: '',
  isTop: false
})

async function submit() {
  form.content = form.content?.trim()
  if (!form.content || form.content === '<p><br></p>') {
    alert('내용을 입력하세요.')
    return
  }

  const authStore = useAdminAuthStore()
  authStore.loadTokenFromStorage()
  const token = authStore.token

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    if (isEdit) {
      await axios.post(`/api/admin/notices/${noticeId}`, form, config)
    } else {
      await axios.post('/api/admin/notices', form, config)
    }

    router.push('/notice')
  } catch (err) {
    console.error('저장 실패:', err)
    alert('저장 중 오류가 발생했습니다.')
  }
}

onMounted(async () => {
  if (isEdit) {
    try {
      const res = await axios.get(`/api/notices/${noticeId}`)
      Object.assign(form, res.data) // title, content, isTop 모두 채움
    } catch (err) {
      console.error('공지사항 조회 실패:', err)
    }
  }
})

function goBack() {
  router.back()
}
</script>

<template>
  <BoardWriteForm @submit="submit" @cancel="goBack">
    <template #fields>
      <div class="form-group mb-3">
        <label>제목</label>
        <input v-model="form.title" class="form-control" required />
      </div>

      <div class="form-group mb-3">
        <label>내용</label>
        <RichTextEditor v-model="form.content" />
      </div>

      <div class="form-check mb-3">
        <input type="checkbox" class="form-check-input" id="isTop" v-model="form.isTop" />
        <label for="isTop" class="form-check-label">상단 고정</label>
      </div>
    </template>
  </BoardWriteForm>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}
</style>