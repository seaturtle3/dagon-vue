<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchFaqById, createFaq, updateFaq, fetchFaqCategories } from '@/api/faq'
import RichTextEditor from '@/components/common/RichTextEditor.vue'

const router = useRouter()
const route = useRoute()
const isEdit = !!route.params.id

const form = ref({
  categoryId: '',
  question: '',
  answer: '',
  isActive: true,
  displayOrder: 0
})

const categories = ref([])

onMounted(async () => {
  categories.value = (await fetchFaqCategories()).data

  if (isEdit) {
    const res = await fetchFaqById(route.params.id)
    form.value = res.data
  }
})

async function submit() {
  if (isEdit) {
    await updateFaq(route.params.id, form.value)
  } else {
    await createFaq(form.value)
  }
  router.push('/faq')
}
</script>

<template>
  <div class="container mt-4">
    <h2>{{ isEdit ? 'FAQ 수정' : 'FAQ 등록' }}</h2>

    <div class="mb-3">
      <label>카테고리</label>
      <select v-model="form.categoryId" class="form-select" required>
        <option disabled value="">카테고리를 선택하세요</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div class="mb-3">
      <label>질문</label>
      <input v-model="form.question" class="form-control" required />
    </div>

    <div class="mb-3">
      <label>답변</label>
      <RichTextEditor v-model="form.answer" editor-id="faqEditor" />
    </div>

    <div class="form-check mb-3">
      <input class="form-check-input" type="checkbox" id="isActive" v-model="form.isActive" />
      <label class="form-check-label" for="isActive">노출 여부</label>
    </div>

    <div class="mb-3">
      <label>표시 순서</label>
      <input type="number" v-model="form.displayOrder" class="form-control" />
    </div>

    <div class="text-end">
      <button @click="submit" class="btn btn-custom">저장</button>
      <button @click="$router.push('/faq')" class="btn btn-secondary">목록</button>
    </div>
  </div>
</template>

<style scoped>

</style>