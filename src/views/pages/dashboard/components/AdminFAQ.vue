<template>
  <div class="faq-container">
    <div class="header">
      <h1>FAQ 관리</h1>
      <button @click="showCreateModal = true" class="create-btn">
        <font-awesome-icon icon="fa-solid fa-plus" /> 새 FAQ 작성
      </button>
    </div>
    
    <!-- 검색 및 필터 -->
    <div class="search-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchParams.keyword" 
          placeholder="질문 또는 답변으로 검색"
          @keyup.enter="handleSearch"
        >
        <button @click="handleSearch" class="search-btn">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
        </button>
      </div>
      <div class="filter-box">
        <select v-model="searchParams.category" @change="handleSearch">
          <option value="">전체 카테고리</option>
          <option value="일반회원">일반회원</option>
          <option value="파트너">파트너</option>
          <option value="관리자">관리자</option>
          <option value="예약관련">예약관련</option>
          <option value="결제관련">결제관련</option>
        </select>
        <select v-model="searchParams.isActive" @change="handleSearch">
          <option value="">전체</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
      </div>
    </div>
    
    <!-- FAQ 목록 -->
    <div class="faq-table">
      <div class="table-header">
        <div class="col-id">번호</div>
        <div class="col-category">카테고리</div>
        <div class="col-question">질문</div>
        <div class="col-status">상태</div>
        <div class="col-date">작성일</div>
        <div class="col-actions">관리</div>
      </div>
      
      <div v-if="loading" class="loading">
        <font-awesome-icon icon="fa-solid fa-spinner" spin />
        <p>FAQ를 불러오는 중...</p>
      </div>
      
      <div v-else-if="faqs.length === 0" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-circle-question" />
        <p>등록된 FAQ가 없습니다.</p>
      </div>
      
      <div v-else class="table-body">
        <div 
          v-for="faq in faqs" 
          :key="faq.faqId" 
          class="table-row"
        >
          <div class="col-id">{{ faq.faqId }}</div>
          <div class="col-category">
            <span class="category-badge">{{ faq.category }}</span>
          </div>
          <div class="col-question" @click="viewFAQ(faq.faqId)" style="cursor: pointer;">
            <span class="question-text">{{ faq.question }}</span>
          </div>
          <div class="col-status">
            <span :class="['status', faq.isActive ? 'active' : 'inactive']">
              {{ faq.isActive ? '활성' : '비활성' }}
            </span>
          </div>
          <div class="col-date">{{ formatDate(faq.createdAt) }}</div>
          <div class="col-actions">
            <button @click="editFAQ(faq)" class="action-btn edit" title="수정">
              <font-awesome-icon icon="fa-solid fa-pen-to-square" />
            </button>
            <button @click="handleDeleteFAQ(faq.faqId)" class="action-btn delete" title="삭제">
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 페이징 -->
    <div class="pagination">
      <button 
        :disabled="currentPage === 0" 
        @click="changePage(currentPage - 1)"
        class="page-btn"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" /> 이전
      </button>
      <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button 
        :disabled="currentPage >= totalPages - 1" 
        @click="changePage(currentPage + 1)"
        class="page-btn"
      >
        다음 <font-awesome-icon icon="fa-solid fa-chevron-right" />
      </button>
    </div>

    <!-- FAQ 작성/수정 모달 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? 'FAQ 수정' : 'FAQ 작성' }}</h2>
          <button @click="closeModal" class="close-btn" title="닫기">
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>
        
        <form @submit.prevent="submitFAQ" class="modal-form">
          <div class="form-group">
            <label>카테고리 *</label>
            <select v-model="faqForm.category" required>
              <option value="">카테고리를 선택하세요</option>
              <option value="일반회원">일반회원</option>
              <option value="파트너">파트너</option>
              <option value="관리자">관리자</option>
              <option value="예약관련">예약관련</option>
              <option value="결제관련">결제관련</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>질문 *</label>
            <input 
              type="text" 
              v-model="faqForm.question" 
              required
              placeholder="자주 묻는 질문을 입력하세요"
            >
          </div>
          
          <div class="form-group">
            <label>답변 *</label>
            <textarea 
              v-model="faqForm.answer" 
              required
              rows="8"
              placeholder="질문에 대한 답변을 입력하세요"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>상태</label>
            <select v-model="faqForm.isActive">
              <option :value="true">활성</option>
              <option :value="false">비활성</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>표시 순서</label>
            <input 
              type="number" 
              v-model="faqForm.displayOrder" 
              min="1"
              placeholder="표시 순서를 입력하세요"
            >
          </div>
          
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="submitting">
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              {{ isEditing ? '수정' : '등록' }}
            </button>
            <button type="button" @click="closeModal" class="cancel-btn">취소</button>
          </div>
        </form>
      </div>
    </div>

    <!-- FAQ 상세보기 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>FAQ 상세보기</h2>
          <button @click="closeDetailModal" class="close-btn" title="닫기">
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>
        
        <div class="faq-detail">
          <div class="faq-category-display">
            <span class="category-badge">{{ selectedFAQ.category }}</span>
          </div>
          <h3>{{ selectedFAQ.question }}</h3>
          <div class="faq-answer">
            <p>{{ selectedFAQ.answer }}</p>
          </div>
          <div class="faq-meta">
            <span>작성일: {{ formatDate(selectedFAQ.createdAt) }}</span>
            <span>상태: {{ selectedFAQ.isActive ? '활성' : '비활성' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAdminAuthStore } from '@/store/auth/auth.js'
import { 
  getAdminFAQs, 
  createFAQ, 
  updateFAQ, 
  deleteFAQ, 
  getFAQById 
} from '@/api/faq.js'

export default {
  name: 'FAQ',
  setup() {
    const authStore = useAdminAuthStore()
    
    // 컴포넌트 마운트 시 토큰 로드
    authStore.loadTokenFromStorage()
    
    // 토큰 유효성 확인
    if (!authStore.isTokenValid()) {
      console.log('토큰이 유효하지 않습니다. 로그인 페이지로 이동합니다.')
      // 로그인 페이지로 리다이렉트
      window.location.href = '/admin/login'
      return {}
    }
    
    console.log('현재 토큰:', authStore.token)
    console.log('인증 상태:', authStore.isAuthenticated)
    
    const faqs = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const currentPage = ref(0)
    const totalPages = ref(0)
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showDetailModal = ref(false)
    const isEditing = ref(false)
    const selectedFAQ = ref(null)
    
    const searchParams = ref({
      keyword: '',
      category: '',
      isActive: '',
      page: 0,
      size: 10
    })
    
    const faqForm = ref({
      category: '',
      question: '',
      answer: '',
      isActive: true,
      displayOrder: 1
    })
    
    const categoryIdToNameMap = {
      1: '일반회원',
      2: '파트너',
      3: '관리자',
      4: '예약관련',
      5: '결제관련',
    }
    
    const handleSearch = () => {
      currentPage.value = 0
      loadFAQs()
    }
    
    const loadFAQs = async () => {
      loading.value = true
      try {
        const categoryNameToIdMap = {
          '일반회원': 1,
          '파트너': 2,
          '관리자': 3,
          '예약관련': 4,
          '결제관련': 5,
        }
        
        const apiParams = {
          page: currentPage.value,
          size: 10,
          keyword: searchParams.value.keyword,
          isActive: searchParams.value.isActive
        }
        
        if (searchParams.value.category) {
          apiParams.categoryId = categoryNameToIdMap[searchParams.value.category]
        }
        
        console.log('FAQ API 호출 파라미터:', apiParams)
        const response = await getAdminFAQs(apiParams)
        console.log('FAQ API 응답:', response)
        
        // API 응답 구조에 따라 데이터 추출
        let faqData = []
        if (response.data && response.data.content) {
          // Spring Boot 페이징 응답 구조
          faqData = response.data.content
          totalPages.value = response.data.totalPages
          currentPage.value = response.data.number
        } else if (Array.isArray(response.data)) {
          // 배열 형태 응답
          faqData = response.data
          totalPages.value = 1
          currentPage.value = 0
        } else {
          // 단일 객체 응답
          faqData = [response.data]
          totalPages.value = 1
          currentPage.value = 0
        }
        
        // 카테고리 ID를 문자열로 변환
        faqs.value = faqData.map(faq => ({
          ...faq,
          category: categoryIdToNameMap[faq.categoryId] || '기타'
        }))
        
        console.log('처리된 FAQ 데이터:', faqs.value)
        
      } catch (error) {
        console.error('FAQ 목록 로드 실패:', error)
        console.error('에러 응답:', error.response)
        
        // 에러 시 빈 배열로 설정 (더미 데이터 제거)
        faqs.value = []
        totalPages.value = 0
        
        // 사용자에게 에러 메시지 표시
        let errorMessage = 'FAQ 목록을 불러오는데 실패했습니다.'
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.'
            authStore.clearToken()
            setTimeout(() => {
              window.location.href = '/admin/login'
            }, 1000)
          } else if (error.response.status === 403) {
            errorMessage = 'FAQ 조회 권한이 없습니다.'
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          }
        }
        alert(errorMessage)
      } finally {
        loading.value = false
      }
    }
    
    const changePage = (page) => {
      currentPage.value = page
      loadFAQs()
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('ko-KR')
    }
    
    const viewFAQ = async (faqId) => {
      try {
        console.log('FAQ 상세 조회 시도:', faqId)
        const response = await getFAQById(faqId)
        console.log('FAQ 상세 조회 응답:', response)
        const data = response.data
        // categoryId → 한글명 변환 (category가 없을 때만)
        if (!data.category && data.categoryId) {
          data.category = categoryIdToNameMap[data.categoryId] || '기타'
        }
        selectedFAQ.value = data
        showDetailModal.value = true
      } catch (error) {
        console.error('FAQ 상세 조회 실패:', error)
        console.error('에러 응답:', error.response)
        
        let errorMessage = 'FAQ 상세 정보를 불러오는데 실패했습니다.'
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.'
            authStore.clearToken()
            setTimeout(() => {
              window.location.href = '/admin/login'
            }, 1000)
          } else if (error.response.status === 403) {
            errorMessage = 'FAQ 조회 권한이 없습니다.'
          } else if (error.response.status === 404) {
            errorMessage = '해당 FAQ를 찾을 수 없습니다.'
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          }
        }
        alert(errorMessage)
      }
    }
    
    const editFAQ = (faq) => {
      isEditing.value = true
      faqForm.value = {
        faqId: faq.faqId,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        isActive: faq.isActive,
        displayOrder: faq.displayOrder || 1
      }
      showEditModal.value = true
    }
    
    const handleDeleteFAQ = async (faqId) => {
      if (!confirm('정말 삭제하시겠습니까?')) return
      
      // 토큰 유효성 확인
      if (!authStore.isTokenValid()) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.')
        window.location.href = '/admin/login'
        return
      }
      
      try {
        console.log('FAQ 삭제 시도:', faqId)
        console.log('사용할 토큰:', authStore.token)
        await deleteFAQ(faqId)
        console.log('FAQ 삭제 성공')
        alert('FAQ가 삭제되었습니다.')
        await loadFAQs()
      } catch (error) {
        console.error('FAQ 삭제 실패:', error)
        console.error('에러 응답:', error.response)
        
        let errorMessage = 'FAQ 삭제에 실패했습니다.'
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.'
            authStore.clearToken()
            setTimeout(() => {
              window.location.href = '/admin/login'
            }, 1000)
          } else if (error.response.status === 403) {
            errorMessage = '삭제 권한이 없습니다.'
          } else if (error.response.status === 404) {
            errorMessage = '삭제할 FAQ를 찾을 수 없습니다.'
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          }
        }
        alert(errorMessage)
      }
    }
    
    const submitFAQ = async () => {
      submitting.value = true
      try {
        // 토큰 유효성 재확인
        if (!authStore.isTokenValid()) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.')
          window.location.href = '/admin/login'
          return
        }
        
        // 클라이언트 측 유효성 검사 (@NotBlank 규칙에 맞춤)
        if (!faqForm.value.category || !faqForm.value.category.trim()) {
          alert('카테고리를 선택해주세요.')
          return
        }
        
        if (!faqForm.value.question || !faqForm.value.question.trim()) {
          alert('질문을 입력해주세요.')
          return
        }
        
        if (!faqForm.value.answer || !faqForm.value.answer.trim()) {
          alert('답변을 입력해주세요.')
          return
        }
        
        // 데이터 정리 (공백 제거)
        const cleanData = {
          category: faqForm.value.category.trim(),
          question: faqForm.value.question.trim(),
          answer: faqForm.value.answer.trim(),
          isActive: faqForm.value.isActive,
          displayOrder: faqForm.value.displayOrder || 1
        }
        
        // @NotBlank 규칙: 공백 문자만으로 구성된 문자열 체크
        if (cleanData.question.replace(/\s/g, '').length === 0) {
          alert('질문에는 공백 외의 문자가 포함되어야 합니다.')
          return
        }
        
        if (cleanData.answer.replace(/\s/g, '').length === 0) {
          alert('답변에는 공백 외의 문자가 포함되어야 합니다.')
          return
        }
        
        // 최소 길이 검사
        if (cleanData.question.length < 5) {
          alert('질문은 최소 5자 이상 입력해주세요.')
          return
        }
        
        if (cleanData.answer.length < 10) {
          alert('답변은 최소 10자 이상 입력해주세요.')
          return
        }
        
        // displayOrder 유효성 검사
        if (!cleanData.displayOrder || cleanData.displayOrder < 1) {
          alert('표시 순서는 1 이상의 숫자를 입력해주세요.')
          return
        }
        
        console.log('정리된 FAQ 데이터:', cleanData)
        console.log('사용할 토큰:', authStore.token)
        
        if (isEditing.value) {
          await updateFAQ(faqForm.value.faqId, cleanData)
          alert('FAQ가 수정되었습니다.')
        } else {
          console.log('FAQ 등록 시도:', cleanData)
          console.log('토큰:', authStore.token)
          const response = await createFAQ(cleanData)
          console.log('FAQ 등록 성공:', response)
          alert('FAQ가 등록되었습니다.')
        }
        closeModal()
        await loadFAQs()
      } catch (error) {
        console.error('FAQ 저장 실패:', error)
        console.error('에러 응답:', error.response)
        console.error('에러 메시지:', error.message)
        
        let errorMessage = 'FAQ 저장에 실패했습니다.'
        if (error.response) {
          // 서버에서 응답이 온 경우
          if (error.response.status === 401) {
            errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.'
            authStore.clearToken()
            setTimeout(() => {
              window.location.href = '/admin/login'
            }, 1000)
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data && error.response.data.errors) {
            // 유효성 검사 에러 처리
            const errors = error.response.data.errors
            const errorDetails = errors.map(err => `${err.field}: ${err.defaultMessage}`).join('\n')
            errorMessage = `입력 데이터를 확인해주세요:\n${errorDetails}`
          } else if (error.response.status === 403) {
            errorMessage = '권한이 없습니다.'
          } else if (error.response.status === 400) {
            errorMessage = '잘못된 요청입니다. 입력 정보를 확인해주세요.'
          } else if (error.response.status === 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          }
        } else if (error.request) {
          // 요청은 보냈지만 응답을 받지 못한 경우
          errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
        } else {
          // 요청 자체를 보내지 못한 경우
          errorMessage = '요청을 보낼 수 없습니다. 다시 시도해주세요.'
        }
        
        alert(errorMessage)
      } finally {
        submitting.value = false
      }
    }
    
    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      isEditing.value = false
      faqForm.value = {
        category: '',
        question: '',
        answer: '',
        isActive: true,
        displayOrder: 1
      }
    }
    
    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedFAQ.value = null
    }
    
    onMounted(() => {
      loadFAQs()
    })
    
    return {
      faqs,
      loading,
      submitting,
      currentPage,
      totalPages,
      showCreateModal,
      showEditModal,
      showDetailModal,
      isEditing,
      selectedFAQ,
      searchParams,
      faqForm,
      loadFAQs,
      changePage,
      formatDate,
      viewFAQ,
      editFAQ,
      handleDeleteFAQ,
      submitFAQ,
      closeModal,
      closeDetailModal,
      handleSearch
    }
  }
}
</script>

<style scoped>
.faq-container {
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.search-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  display: flex;
  position: relative;
}

.search-box input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
}

.filter-box {
  display: flex;
  gap: 0.5rem;
}

.filter-box select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-box select:focus {
  outline: none;
  border-color: #667eea;
}

.faq-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 120px 1fr 100px 120px 120px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.table-header > div {
  color: white !important;
  font-weight: 600;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 120px 1fr 100px 120px 120px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
  align-items: center;
  font-size: 0.95rem;
}

.table-row:hover {
  background-color: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.col-id, .col-category, .col-status, .col-date {
  color: #64748b;
  font-weight: 500;
  text-align: center;
}

.col-question {
  color: #1e293b;
  font-weight: 600;
  text-align: left;
}

.category-badge {
  background: #fbbf24;
  color: #92400e;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  margin-right: 0.5rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  display: inline-block;
}
.status.active {
  background: #d1fae5;
  color: #065f46;
}
.status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: white;
  font-size: 0.9rem;
}

.action-btn.edit {
  background-color: #f59e0b;
}

.action-btn.delete {
  background-color: #ef4444;
}

.action-btn.edit:hover,
.action-btn.delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.loading, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
}

.loading i, .empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.empty-state i {
  color: #cbd5e0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  background-color: #f8fafc;
  color: #cbd5e0;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #64748b;
  min-width: 80px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #e2e8f0;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  padding: 0.75rem 2rem;
  background: #f1f5f9;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.faq-detail {
  padding: 1.5rem;
}

.faq-category-display {
  margin-bottom: 1rem;
}

.faq-detail h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  line-height: 1.4;
}

.faq-answer {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.faq-meta {
  display: flex;
  gap: 2rem;
  color: #6c757d;
  font-size: 0.9rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .faq-container {
    padding: 1rem;
  }
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  .search-section {
    flex-direction: column;
  }
  .search-box {
    min-width: auto;
  }
  .filter-box {
    justify-content: stretch;
  }
  .filter-box select {
    flex: 1;
  }
  .table-header,
  .table-row {
    grid-template-columns: 60px 100px 1fr 80px 100px 100px;
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
  }
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
  .faq-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style> 