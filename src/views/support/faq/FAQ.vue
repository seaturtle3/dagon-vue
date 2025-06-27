<template>
  <div class="faq-container">
    <div class="faq-header">
      <h1 class="faq-title">자주하는 질문</h1>
      <p class="faq-subtitle">고객님들이 자주 문의하시는 내용들을 모았습니다.</p>
    </div>

    <div class="faq-content">
      <!-- 검색 기능 -->
      <div class="search-section">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="궁금한 내용을 검색해보세요..."
            class="search-input"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>

      <!-- 카테고리 필터 -->
      <div class="category-filter">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="['category-btn', { active: selectedCategory === category.id }]"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- FAQ 목록 -->
      <div class="faq-list">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>FAQ를 불러오는 중...</p>
        </div>
        
        <div
          v-else
          v-for="faq in filteredFAQs"
          :key="faq.faqId"
          class="faq-item"
          :class="{ expanded: expandedItems.includes(faq.faqId) }"
        >
          <div
            class="faq-question"
            @click="toggleFAQ(faq.faqId)"
          >
            <span class="question-text">{{ faq.question }}</span>
            <i class="fas fa-chevron-down arrow-icon"></i>
          </div>
          <div class="faq-answer">
            <div class="answer-content">{{ faq.answer }}</div>
            <div class="faq-meta">
              <span class="category-tag">{{ faq.categoryName }}</span>
              <span class="update-date">{{ formatDate(faq.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 검색 결과가 없을 때 -->
      <div v-if="!loading && filteredFAQs.length === 0 && searchQuery" class="no-results">
        <i class="fas fa-search"></i>
        <p>"{{ searchQuery }}"에 대한 검색 결과가 없습니다.</p>
        <button @click="clearSearch" class="clear-search-btn">검색 초기화</button>
      </div>
      
      <!-- FAQ가 없을 때 -->
      <div v-if="!loading && faqs.length === 0" class="no-faqs">
        <i class="fas fa-question-circle"></i>
        <p>등록된 FAQ가 없습니다.</p>
      </div>
    </div>

    <!-- 추가 문의 섹션 -->
    <div class="contact-section">
      <div class="contact-content">
        <h3>더 궁금한 점이 있으신가요?</h3>
        <p>원하시는 답변을 찾지 못하셨다면 언제든 문의해주세요.</p>
        <div class="contact-buttons">
          <router-link to="/inquiry" class="contact-btn primary">
            <i class="fas fa-comments"></i>
            1:1 문의하기
          </router-link>
          <router-link to="/customer-service" class="contact-btn secondary">
            <i class="fas fa-phone"></i>
            고객센터
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchFAQs } from '@/api/faq.js'

// 상태 관리
const searchQuery = ref('')
const selectedCategory = ref('all')
const expandedItems = ref([])
const loading = ref(false)

// 카테고리 데이터 (ID와 이름 매핑)
const categories = ref([
  { id: 'all', name: '전체' },
  { id: 1, name: '일반회원' },
  { id: 2, name: '파트너' },
  { id: 3, name: '관리자' },
  { id: 4, name: '예약관련' },
  { id: 5, name: '결제관련' },
])
const categoryIdToNameMap = {
  4: '예약관련',
  5: '결제관련',
}

// FAQ 데이터
const faqs = ref([])

// FAQ 목록 로드
const loadFAQs = async () => {
  loading.value = true
  try {
    const params = {
      isActive: true,
      size: 100 // 충분한 수의 FAQ를 가져오기 위해
    }
    
    // 선택된 카테고리가 'all'이 아니면 파라미터에 추가
    if (selectedCategory.value !== 'all') {
      params.categoryId = selectedCategory.value
    } else {
      params.categoryId = null // '전체'일 경우 null 또는 undefined로 설정
    }

    const response = await fetchFAQs(params)
    const faqData = response.data.content || response.data || []

    // categoryName이 이미 있으면 그대로, 없으면 매핑
    faqs.value = faqData.map(faq => ({
      ...faq,
      categoryName: faq.categoryName || categoryIdToNameMap[faq.categoryId] || '기타'
    }))

  } catch (error) {
    console.error('FAQ 목록 로드 실패:', error)
    // 에러 시 기본 데이터 표시
    faqs.value = [
      {
        faqId: 1,
        categoryId: 1,
        question: '어떻게 예약하나요?',
        answer: '홈페이지에서 원하는 날짜와 시간을 선택하여 예약할 수 있습니다. 예약 페이지에서 선사와 날짜를 선택한 후 결제를 진행하시면 됩니다.',
        createdAt: '2024-01-15',
        isActive: true,
        categoryName: '이용방법'
      },
      {
        faqId: 2,
        categoryId: 2,
        question: '예약 취소는 언제까지 가능한가요?',
        answer: '예약 취소는 출발 24시간 전까지 가능합니다. 24시간 이내 취소 시 환불이 제한될 수 있습니다.',
        createdAt: '2024-01-20',
        isActive: true,
        categoryName: '예약'
      },
      {
        faqId: 3,
        categoryId: 3,
        question: '어떤 결제 방법을 지원하나요?',
        answer: '신용카드, 계좌이체, 간편결제(카카오페이, 네이버페이)를 지원합니다.',
        createdAt: '2024-01-25',
        isActive: true,
        categoryName: '결제'
      }
    ]
  } finally {
    loading.value = false
  }
}

// 필터링된 FAQ 목록
const filteredFAQs = computed(() => {
  let filtered = faqs.value

  // 검색어 필터링
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(faq => 
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    )
  }

  return filtered
})

// FAQ 토글
const toggleFAQ = (id) => {
  const index = expandedItems.value.indexOf(id)
  if (index === -1) {
    expandedItems.value.push(id)
  } else {
    expandedItems.value.splice(index, 1)
  }
}

// 카테고리 선택 시 FAQ 다시 로드
watch(selectedCategory, () => {
  loadFAQs()
})

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR')
}

// 검색 초기화
const clearSearch = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
}

// 컴포넌트 마운트 시 FAQ 로드
onMounted(() => {
  loadFAQs()
})
</script>

<style scoped>
.faq-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.faq-header {
  text-align: center;
  margin-bottom: 3rem;
}

.faq-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.faq-subtitle {
  font-size: 1.1rem;
  color: #718096;
}

.search-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.category-filter {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  background: white;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.category-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.faq-list {
  margin-bottom: 3rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.loading i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.no-faqs {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.no-faqs i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e0;
}

.faq-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.faq-question {
  padding: 1.5rem;
  background: #f8fafc;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s ease;
}

.faq-question:hover {
  background: #edf2f7;
}

.question-text {
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.arrow-icon {
  color: #a0aec0;
  transition: transform 0.3s ease;
}

.faq-item.expanded .arrow-icon {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-item.expanded .faq-answer {
  max-height: 500px;
}

.answer-content {
  padding: 1.5rem;
  color: #4a5568;
  line-height: 1.6;
}

.faq-meta {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.category-tag {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
}

.update-date {
  color: #a0aec0;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e0;
}

.clear-search-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.clear-search-btn:hover {
  background: #5a67d8;
}

.contact-section {
  background: #f8fafc;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  margin-top: 3rem;
}

.contact-content h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.contact-content p {
  color: #718096;
  margin-bottom: 2rem;
}

.contact-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.contact-btn.primary {
  background: #667eea;
  color: white;
}

.contact-btn.primary:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.contact-btn.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.contact-btn.secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .faq-container {
    padding: 1rem;
  }
  
  .faq-title {
    font-size: 2rem;
  }
  
  .category-filter {
    gap: 0.5rem;
  }
  
  .category-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .contact-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .contact-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}
</style> 