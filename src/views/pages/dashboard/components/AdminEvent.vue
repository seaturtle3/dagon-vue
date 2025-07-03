<template>
  <div class="events-container">
    <div class="header">
      <h1>이벤트 관리</h1>
      <button @click="openCreateModal" class="create-btn">
        <font-awesome-icon icon="fa-solid fa-plus" /> 새 이벤트 작성
      </button>
    </div>
    <!-- 검색/필터 -->
    <div class="search-section">
      <div class="search-box">
        <input v-model="searchParams.keyword" placeholder="제목으로 검색" @keyup.enter="loadEvents" />
        <button @click="loadEvents" class="search-btn"><font-awesome-icon icon="fa-solid fa-magnifying-glass" /></button>
      </div>
      <div class="filter-box">
        <select v-model="searchParams.status" @change="loadEvents">
          <option value="">전체 상태</option>
          <option value="SCHEDULED">진행예정</option>
          <option value="ONGOING">진행중</option>
          <option value="COMPLETED">종료</option>
        </select>
      </div>
    </div>
    <!-- 테이블 -->
    <div class="events-table">
      <div class="table-header">
        <div class="col-id">번호</div>
        <div class="col-thumbnail">썸네일</div>
        <div class="col-title">제목</div>
        <div class="col-period">기간</div>
        <div class="col-status">상태</div>
        <div class="col-top"></div>
        <div class="col-actions">관리</div>
      </div>
      <div v-if="loading" class="loading">
        <font-awesome-icon icon="fa-solid fa-spinner" spin />
        <p>이벤트를 불러오는 중...</p>
      </div>
      <div v-else-if="events.length === 0" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-calendar-days" />
        <p>등록된 이벤트가 없습니다.</p>
      </div>
      <div v-else class="table-body">
        <div v-for="(event, idx) in events" :key="event.eventId" class="table-row">
          <div class="col-id">{{ idx + 1 + searchParams.page * searchParams.size }}</div>
          <div class="col-thumbnail">
            <div v-if="getEventThumbnail(event)" class="thumbnail-preview" @click="openDetailModal(event.eventId)" style="cursor:pointer;">
              <img :src="getEventThumbnail(event)" :alt="event.title" />
            </div>
            <div v-else class="thumbnail-placeholder">
              <font-awesome-icon icon="fa-solid fa-image" />
            </div>
          </div>
          <div class="col-title" @click="openDetailModal(event.eventId)" style="cursor:pointer;">
            <span v-if="event.isTop" class="top-badge">고정</span>
            <span>{{ event.title }}</span>
          </div>
          <div class="col-period">{{ formatPeriod(event.startAt, event.endAt) }}</div>
          <div class="col-status">
            <span :class="['status-badge', event.eventStatus]">{{ statusText(event.eventStatus) }}</span>
          </div>
          <div class="col-top"></div>
          <div class="col-actions">
            <button @click="openEditModal(event)" class="action-btn edit" title="수정"><font-awesome-icon icon="fa-solid fa-pen-to-square" /></button>
            <button @click="toggleTop(event)" class="action-btn" :class="event.isTop ? 'top-active' : 'top'" :title="event.isTop ? '고정해제' : '고정'">
              <font-awesome-icon icon="fa-solid fa-star" />
            </button>
            <button @click="deleteEventHandler(event.eventId)" class="action-btn delete" title="삭제">
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 페이징 -->
    <div class="pagination">
      <button :disabled="searchParams.page === 0" @click="changePage(searchParams.page - 1)" class="page-btn">
        <font-awesome-icon icon="fa-solid fa-chevron-left" /> 이전
      </button>
      <span class="page-info">{{ searchParams.page + 1 }} / {{ totalPages }}</span>
      <button :disabled="searchParams.page >= totalPages - 1" @click="changePage(searchParams.page + 1)" class="page-btn">
        다음 <font-awesome-icon icon="fa-solid fa-chevron-right" />
      </button>
    </div>
    <!-- 등록/수정/상세 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>
            {{ modalMode === 'create' ? '이벤트 작성' : modalMode === 'edit' ? '이벤트 수정' : '이벤트 상세' }}
          </h2>
          <button @click="closeModal" class="close-btn"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
        </div>
        <form v-if="modalMode !== 'detail'" @submit.prevent="submitEvent" class="modal-form">
          <div class="form-group">
            <label>제목 *</label>
            <input v-model="eventForm.title" required placeholder="이벤트 제목을 입력하세요" />
          </div>
          <div class="form-group">
            <label>이벤트 기간</label>
            <div class="date-range">
              <input type="date" v-model="eventForm.startAt" />
              <span>~</span>
              <input type="date" v-model="eventForm.endAt">
            </div>
          </div>
          <div class="form-group">
            <label>썸네일 이미지</label>
            <input type="file" accept="image/*" @change="handleThumbnailUpload" />
            <div v-if="getEventThumbnail(eventForm)" class="mt-2">
              <img :src="getEventThumbnail(eventForm)" alt="썸네일 미리보기" style="max-width: 200px; max-height: 120px; border-radius: 4px; object-fit: cover;" />
            </div>
          </div>
          <div class="form-group">
            <label>내용 *</label>
            <RichTextEditor v-model="eventForm.content" />
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="eventForm.isTop" />
              상단 고정
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="submitting">
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              {{ modalMode === 'edit' ? '수정' : '등록' }}
            </button>
            <button type="button" @click="closeModal" class="cancel-btn">취소</button>
          </div>
        </form>
        <div v-else class="event-detail">
          <h3>
            <span v-if="eventForm.isTop" class="top-badge">고정</span>
            {{ eventForm.title }}
          </h3>
          <div class="event-meta">
            <span>기간: {{ formatPeriod(eventForm.startAt, eventForm.endAt) }}</span>
          </div>
          <div class="event-content" v-html="eventForm.content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { fetchEvents, fetchEventById, createEvent, updateEvent, deleteEvent as apiDeleteEvent } from '@/api/event.js'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { BASE_URL } from '@/constants/baseUrl.js'

const events = ref([])
const loading = ref(false)
const submitting = ref(false)
const totalPages = ref(1)
const showModal = ref(false)
const modalMode = ref('create') // 'create' | 'edit' | 'detail'
const eventForm = reactive({
  eventId: null,
  title: '',
  content: '',
  startAt: '',
  endAt: '',
  thumbnailUrl: '',
  isTop: false,
  eventStatus: ''
})
const searchParams = reactive({
  keyword: '',
  status: '',
  page: 0,
  size: 10
})

// 파일 업로드 관련 상태 추가
const uploadedFiles = ref([])

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('ko-KR')
  } catch {
    return ''
  }
}

function formatPeriod(startAt, endAt) {
  if (!startAt && !endAt) return '상시 진행'
  const start = formatDate(startAt)
  const end = formatDate(endAt)
  if (!start && !end) return '상시 진행'
  if (start && !end) return `${start} ~ 미정`
  if (!start && end) return `미정 ~ ${end}`
  return `${start} ~ ${end}`
}

function statusText(status) {
  if (status === 'SCHEDULED') return '진행예정'
  if (status === 'ONGOING') return '진행중'
  if (status === 'COMPLETED') return '종료'
  return status || ''
}

const getEventThumbnail = (event) => {
  // 1. imageDataList
  if (event?.imageDataList && event.imageDataList.length > 0) {
    return `data:image/jpeg;base64,${event.imageDataList[0]}`
  }
  // 2. thumbnailDataList
  if (event?.thumbnailDataList && event.thumbnailDataList.length > 0) {
    return `data:image/jpeg;base64,${event.thumbnailDataList[0]?.thumbnail_data}`
  }
  // 3. thumbnailUrl
  if (event?.thumbnailUrl) {
    if (event.thumbnailUrl.startsWith('http')) return event.thumbnailUrl
    return `${BASE_URL}${event.thumbnailUrl}`
  }
  // fallback(없으면 빈 문자열)
  return ''
}

const loadEvents = async () => {
  loading.value = true
  try {
    const params = { ...searchParams }
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    const res = await fetchEvents(params)
    if (res.data && res.data.content) {
      events.value = res.data.content
      totalPages.value = res.data.totalPages
      searchParams.page = res.data.number
    } else {
      events.value = []
      totalPages.value = 1
      searchParams.page = 0
    }
  } catch (error) {
    console.error('이벤트 목록 로드 실패:', error)
    events.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  modalMode.value = 'create'
  Object.assign(eventForm, {
    eventId: null,
    title: '',
    content: '',
    startAt: '',
    endAt: '',
    thumbnailUrl: '',
    isTop: false,
    eventStatus: ''
  })
  showModal.value = true
}
function openEditModal(event) {
  modalMode.value = 'edit'
  Object.assign(eventForm, { ...event })
  showModal.value = true
}
async function openDetailModal(eventId) {
  modalMode.value = 'detail'
  loading.value = true
  try {
    const res = await fetchEventById(eventId)
    Object.assign(eventForm, res.data)
    showModal.value = true
  } catch (error) {
    alert('이벤트 상세 조회 실패')
  } finally {
    loading.value = false
  }
}
function closeModal() {
  showModal.value = false
}

const submitEvent = async () => {
  submitting.value = true
  try {
    const data = {
      title: eventForm.title.trim(),
      content: eventForm.content.trim(),
      startAt: eventForm.startAt,
      endAt: eventForm.endAt,
      thumbnailUrl: eventForm.thumbnailUrl,
      isTop: eventForm.isTop
    }
    
    if (modalMode.value === 'edit') {
      await updateEvent(eventForm.eventId, data, uploadedFiles.value)
      alert('이벤트가 수정되었습니다.')
    } else {
      await createEvent(data, uploadedFiles.value)
      alert('이벤트가 등록되었습니다.')
    }
    closeModal()
    uploadedFiles.value = [] // 파일 초기화
    await loadEvents()
  } catch (error) {
    console.error('이벤트 저장 실패:', error)
    alert('저장 실패')
  } finally {
    submitting.value = false
  }
}

const deleteEventHandler = async (eventId) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    await apiDeleteEvent(eventId)
    alert('이벤트가 삭제되었습니다.')
    await loadEvents()
  } catch (error) {
    alert('삭제 실패')
  }
}

const toggleTop = async (event) => {
  try {
    await updateEvent(event.eventId, {
      ...event,
      isTop: !event.isTop
    });
    await loadEvents();
  } catch (error) {
    alert('고정 상태 변경 실패');
  }
}

function changePage(page) {
  searchParams.page = page
  loadEvents()
}

async function handleThumbnailUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB 이하여야 합니다.')
    return
  }
  
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.')
    return
  }
  
  // 파일을 uploadedFiles에 추가
  uploadedFiles.value = [file]
  
  // 미리보기용 URL 생성
  const reader = new FileReader()
  reader.onload = (e) => {
    eventForm.thumbnailUrl = e.target.result
  }
  reader.readAsDataURL(file)
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
/* FAQ/Notice 스타일 참고해서 테이블, 모달, 버튼 등 통일 */
.events-container {
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
.events-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}
.table-header {
  display: grid;
  grid-template-columns: 60px 80px 1fr 180px 100px 80px 120px;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 1rem;
}
.table-body {
  max-height: 600px;
  overflow-y: auto;
}
.table-row {
  display: grid;
  grid-template-columns: 60px 80px 1fr 180px 100px 80px 120px;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
  align-items: center;
  color: #1e293b;
  font-size: 0.95rem;
}
.table-row:hover {
  background-color: #f8fafc;
}
.col-id, .col-status, .col-top {
  text-align: center;
}

/* 썸네일 컬럼 스타일 */
.col-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-preview {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease;
}

.thumbnail-preview:hover {
  transform: scale(1.05);
}

.thumbnail-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-placeholder {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e0;
  font-size: 0.8rem;
}
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-badge.SCHEDULED { background: #e0e7ff; color: #3730a3; }
.status-badge.ONGOING { background: #d1fae5; color: #065f46; }
.status-badge.COMPLETED { background: #fee2e2; color: #991b1b; }
.top-badge {
  background: #fbbf24;
  color: #92400e;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  margin-right: 0.5rem;
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


.action-btn.top-active {
  background-color: #fbbf24;
}
.action-btn.top:hover, .action-btn.top-active:hover {
  filter: brightness(0.95);
}


.action-btn.edit { background-color: #f59e0b; }
.action-btn.delete { background-color: #ef4444; }
.action-btn.edit:hover, .action-btn.delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-btn.top {
  background-color: #ebebeb;
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
.empty-state i { color: #cbd5e0; }
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
.close-btn:hover { background: #e2e8f0; }
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
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}
.form-group textarea {
  resize: vertical;
  min-height: 120px;
}
.checkbox-group {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
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
.event-detail h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.4;
}
.event-meta {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}
.event-content {
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 1rem;
}
@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 60px 1fr 100px 80px 60px 80px;
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
  }
  .thumbnail-preview,
  .thumbnail-placeholder {
    width: 50px;
    height: 35px;
  }
  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style> 