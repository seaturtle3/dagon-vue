<script setup>
import {ref, onMounted} from 'vue'
import {fetchFaqCategories, fetchFaqList, deleteFaq} from '@/api/faq'
import {useRouter} from 'vue-router'
import BoardPagination from "@/components/common/BoardPagination.vue";

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
    faqType: faqType.value !== 'ALL' ? faqType.value.toLowerCase() : undefined,
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

function goToEdit(id) {
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
  <div class="event-list center">
    <h2 class="center-title">자주 묻는 질문</h2>

    <!-- 🔷 검색 필터 -->
    <div class="mb-3 d-flex gap-2 justify-content-center">
      <select v-model="faqType" class="form-select w-auto">
        <option value="ALL">전체</option>
        <option value="QUESTION">질문</option>
        <option value="ANSWER">답변</option>
      </select>
      <input
          v-model="keyword"
          class="form-control w-25"
          placeholder="검색어 입력"
          @keyup.enter.prevent="loadFaqs(0)"
      />
      <button class="btn btn-outline-secondary" @click="() => loadFaqs()">검색</button>
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
    <div class="list-body">
      <div v-if="faqs.length === 0" class="text-muted text-center mt-5">
        등록된 FAQ가 없습니다.
      </div>

      <div v-else>
        <div v-for="(faq, index) in faqs" :key="faq.faqId" class="section-box">
          <!-- 카테고리명 -->
          <div class="d-flex justify-content-between align-items-center mb-1">
            <div class="faq-tag">{{ faq.categoryName }}</div>

            <div v-if="isAdmin" class="text-muted small d-flex align-items-center gap-2">
              <span class="faq-meta">순서: {{ faq.displayOrder }}</span>
              <span class="faq-meta">
                <span class="status-dot" :class="faq.isActive ? 'active' : 'inactive'"></span>
                {{ faq.isActive ? '활성' : '비활성' }}
              </span>
            </div>
          </div>

          <!-- 질문 -->
          <div
              @click="toggleAnswer(index)"
              class="fw-bold fs-5 mt-1"
              style="cursor: pointer;"
          >
            Q: {{ faq.question }}
          </div>

          <!-- 답변 -->
          <transition name="fade">
            <div
                v-show="openIndexes.has(index)"
                class="faq-answer-box mt-2"
                v-html="faq.answer"
            />
          </transition>


          <div v-if="isAdmin" class="text-end mt-2">
            <button
                v-if="isAdmin"
                class="btn btn-sm me-2 btn-outline-primary"
                @click="goToEdit(faq.faqId)"
            >
              수정
            </button>

            <button class="btn btn-sm btn-outline-danger" @click="handleDelete(faq.faqId)">삭제</button>
          </div>
        </div>
      </div>

    </div>

    <!-- 🔷 페이지네이션 -->
    <BoardPagination
        v-if="totalPages > 1"
        :page="currentPage"
        :totalPages="totalPages"
        @change="loadFaqs"
    />
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
}

.center-title {
  text-align: center;
  margin-bottom: 1.5rem;
}

.section-box {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.section-box:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.faq-answer-box {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 0.75rem;
  border-left: 4px solid #0d6efd;
  border: 1px solid #e0e0e0;
  color: #333;
}

.faq-tag {
  display: inline-block;
  background-color: #e9ecef;
  color: #495057;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25em 0.6em;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}

.status-dot.active {
  background-color: #28a745; /* Bootstrap success green, or use #0d6efd for blue */
}

.status-dot.inactive {
  background-color: #adb5bd; /* Bootstrap secondary gray */
}

.faq-meta {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
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


.list-body {
  margin-bottom: 20px;
}
</style>