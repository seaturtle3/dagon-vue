<script setup>
import { ref, onMounted } from 'vue'
import { fetchFaqCategories, fetchFaqList } from '@/api/faq'

const categories = ref([])
const faqs = ref([])
const selectedCategory = ref('')
const currentPage = ref(0)
const totalPages = ref(0)

onMounted(async () => {
  const res = await fetchFaqCategories()
  categories.value = res.data
  await loadFaqs()
})

async function loadFaqs(page = 0) {
  const res = await fetchFaqList(page)
  faqs.value = res.data.content
  currentPage.value = res.data.number
  totalPages.value = res.data.totalPages
}
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-3">자주 묻는 질문</h2>

    <!-- ✅ 카테고리 필터 버튼 -->
    <div class="mb-3">
      <button class="btn btn-outline-primary me-2 mb-2"
              :class="{ active: selectedCategory === '' }"
              @click="selectedCategory = ''; loadFaqs()">
        전체
      </button>
      <button v-for="cat in categories" :key="cat.id"
              class="btn btn-outline-primary me-2 mb-2"
              :class="{ active: selectedCategory === cat.id }"
              @click="selectedCategory = cat.id; loadFaqs()">
        {{ cat.name }}
      </button>
    </div>

    <!-- ✅ FAQ 목록 -->
    <div v-if="faqs.length === 0" class="text-muted text-center mt-5">
      등록된 FAQ가 없습니다.
    </div>
    <div v-else>
      <div v-for="faq in faqs" :key="faq.faqId" class="border p-3 mb-3">
        <strong>{{ faq.categoryName }} · {{ faq.question }}</strong>
        <div class="text-muted small mt-1">순서: {{ faq.displayOrder }} / 상태: {{ faq.isActive ? '활성' : '비활성' }}</div>
        <div v-html="faq.answer" class="mt-2" />
      </div>
    </div>

    <!-- ✅ 페이징 -->
    <div class="mt-4 d-flex justify-content-center" v-if="totalPages > 1">
      <button class="btn btn-sm btn-outline-secondary me-2"
              :disabled="currentPage === 0"
              @click="loadFaqs(currentPage - 1)">
        이전
      </button>
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button class="btn btn-sm btn-outline-secondary ms-2"
              :disabled="currentPage === totalPages - 1"
              @click="loadFaqs(currentPage + 1)">
        다음
      </button>
    </div>
  </div>
</template>

<style scoped>
.active {
  background-color: #007bff;
  color: white;
}
</style>