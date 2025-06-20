<script setup>
import { ref, onMounted } from 'vue'
import { fetchFaqCategories, fetchFaqList, deleteFaq } from '@/api/faq'
import { useRouter } from 'vue-router'

const categories = ref([])
const faqs = ref([])
const selectedCategory = ref('')
const keyword = ref('')
const faqType = ref('ALL')
const currentPage = ref(0)
const totalPages = ref(0)
const openIndexes = ref(new Set())

const isAdmin = ref(false)
const router = useRouter()

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      isAdmin.value = payload?.role === 'ADMIN'
    } catch {
      isAdmin.value = false
    }
  }

  const res = await fetchFaqCategories()
  categories.value = res.data
  await loadFaqs()
})

async function loadFaqs(page = 0) {
  const params = {
    page,
    size: 10,
    categoryId: selectedCategory.value || undefined,
    keyword: keyword.value || undefined,
    faqType: faqType.value !== 'ALL' ? faqType.value : undefined,
  }

  try {
    const res = await fetchFaqList(params)
    faqs.value = res.data.content
    currentPage.value = res.data.number
    totalPages.value = res.data.totalPages
  } catch (e) {
    console.error('FAQ 불러오기 실패', e)
  }
}

function toggleAnswer(index) {
  if (openIndexes.value.has(index)) {
    openIndexes.value.delete(index)
  } else {
    openIndexes.value.add(index)
  }
}

function handleEdit(id) {
  router.push(`/faq/edit/${id}`)
}

async function handleDelete(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    await deleteFaq(id)
    await loadFaqs(currentPage.value)
  }
}
</script>

<template>
  <div class="container mt-4">
    <h2 class="page-title">자주 묻는 질문</h2>

    <!-- 🔷 검색 필터 -->
    <div class="d-flex mb-4 align-items-center gap-2">
      <select v-model="faqType" class="form-select w-auto">
        <option value="ALL">전체</option>
        <option value="QUESTION">질문</option>
        <option value="ANSWER">답변</option>
      </select>
      <input
          v-model="keyword"
          class="form-control w-25"
          placeholder="검색어 입력"
          @keyup.enter="loadFaqs"
      />
      <button class="btn btn-outline-secondary" @click="loadFaqs">검색</button>
    </div>

    <!-- 🔷 카테고리 버튼 -->
    <div class="mb-3 d-flex flex-wrap gap-2">
      <button
          class="btn btn-sm"
          :class="selectedCategory === '' ? 'btn-primary' : 'btn-outline-primary'"
          @click="selectedCategory = ''; loadFaqs()"
      >
        전체
      </button>

      <button
          v-for="cat in categories"
          :key="cat.id"
          class="btn btn-sm"
          :class="selectedCategory === cat.id ? 'btn-secondary' : 'btn-outline-secondary'"
          @click="selectedCategory = cat.id; loadFaqs()"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- 🔷 FAQ 목록 -->
    <div v-if="faqs.length === 0" class="text-muted text-center mt-5">
      등록된 FAQ가 없습니다.
    </div>
    <div v-else>
      <div v-for="(faq, index) in faqs" :key="faq.faqId" class="section-box">
        <!-- 카테고리명 -->
        <div class="text-muted small">{{ faq.categoryName }}</div>

        <!-- 질문 -->
        <div
            @click="toggleAnswer(index)"
            class="fw-bold fs-5 mt-1"
            style="cursor: pointer;"
        >
          {{ faq.question }}
        </div>

        <!-- 답변 -->
        <transition name="fade">
          <div
              v-show="openIndexes.has(index)"
              class="faq-answer-box mt-2"
              v-html="faq.answer"
          />
        </transition>

        <!-- 관리자 전용 -->
        <div v-if="isAdmin" class="text-muted small mt-2">
          표시 순서: {{ faq.displayOrder }} / 상태: {{ faq.isActive ? '활성' : '비활성' }}
        </div>

        <div v-if="isAdmin" class="text-end mt-2">
          <button class="btn btn-sm btn-outline-primary me-2" @click="handleEdit(faq.faqId)">수정</button>
          <button class="btn btn-sm btn-outline-danger" @click="handleDelete(faq.faqId)">삭제</button>
        </div>
      </div>
    </div>

    <!-- 🔷 페이지네이션 -->
    <div class="simple-pagination mt-4" v-if="totalPages > 1">
      <a href="#" :class="{ disabled: currentPage === 0 }" @click.prevent="loadFaqs(currentPage - 1)">이전</a>
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <a href="#" :class="{ disabled: currentPage === totalPages - 1 }" @click.prevent="loadFaqs(currentPage + 1)">다음</a>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-weight: 700;
  font-size: 1.5rem;
}

.section-box {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.faq-answer-box {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 0.75rem;
  border-left: 4px solid #0d6efd;
  border: 1px solid #e0e0e0;
  color: #333;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  height: 0;
  padding: 0;
  margin: 0;
}
</style>