<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchAdminFaqCategories,
  fetchFaqDetail,
  createFaq,
  updateFaq
} from '@/api/faq'

import RichTextEditor from '@/components/common/RichTextEditor.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const isEdit = !!id

const formAction = ref(isEdit ? '수정' : '등록')

const form = ref({
  categoryId: '',
  question: '',
  answer: '',
  isActive: true,
  displayOrder: 1,
})

const categories = ref([])

onMounted(async () => {
  const res = await fetchAdminFaqCategories()
  categories.value = res.data

  if (isEdit) {
    const res = await fetchFaqDetail(id)
    form.value = {
      categoryId: res.data.categoryId,
      question: res.data.question,
      answer: res.data.answer,
      isActive: res.data.isActive,
      displayOrder: res.data.displayOrder
    }
  }
})

async function handleSubmit() {
  const payload = {
    categoryId: Number(form.value.categoryId),
    question: form.value.question,
    answer: form.value.answer,
    isActive: Boolean(form.value.isActive),
    displayOrder: Number(form.value.displayOrder)
  }

  if (isEdit) {
    await updateFaq(id, payload)
  } else {
    await createFaq(payload)
  }

  router.push('/faq')
}

function handleCancel() {
  router.push('/faq')
}
</script>

<template>
  <div class="container mt-5" style="max-width: 700px">
    <h3>FAQ {{ formAction }}</h3>

    <!-- 🔹 카테고리 -->
    <div class="mb-3">
      <label class="form-label">카테고리</label>
      <select v-model="form.categoryId" class="form-select">
        <option disabled value="">카테고리를 선택하세요</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <!-- 🔹 질문 -->
    <div class="mb-3">
      <label class="form-label">질문</label>
      <input type="text" class="form-control" v-model="form.question" />
    </div>

    <!-- 🔹 답변 -->
    <div class="mb-3">
      <label class="form-label">답변</label>
      <RichTextEditor v-model="form.answer" />
    </div>

    <!-- 🔹 노출 여부 -->
    <div class="form-check mb-3">
      <input type="checkbox" class="form-check-input" id="isActive" v-model="form.isActive" />
      <label class="form-check-label" for="isActive">노출 여부</label>
    </div>

    <!-- 🔹 표시 순서 -->
    <div class="mb-3">
      <label class="form-label">표시 순서</label>
      <input type="number" class="form-control" v-model="form.displayOrder" min="1" />
    </div>

    <div class="text-end">
      <button class="btn btn-dark me-2" @click="handleSubmit">저장</button>
      <button class="btn btn-outline-secondary" @click="handleCancel">목록으로</button>
    </div>
  </div>
</template>

<style scoped>

</style>