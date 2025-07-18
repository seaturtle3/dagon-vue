<template>
  <div class="fishing-report-detail">
    <div class="header">
      <h2>조황정보 상세</h2>
      <div class="header-actions">
        <button @click="goBack" class="btn-back">
          <i class="fas fa-arrow-left"></i> 목록으로
        </button>
        <button @click="editReport" class="btn-edit">
          <i class="fas fa-edit"></i> 수정
        </button>
        <button @click="deleteReport" class="btn-delete">
          <i class="fas fa-trash"></i> 삭제
        </button>
      </div>
    </div>

    <!-- 네비게이션 바 -->
    <div class="navigation-bar">
      <button 
        @click="goToPrevious" 
        :disabled="!prevNext.prev"
        class="nav-btn nav-prev"
        title="이전 조황정보 (←)"
      >
        <i v-if="prevNext.prev" class="fas fa-chevron-left"></i>
        <span class="nav-text">이전</span>
      </button>
      
      <div class="nav-info">
        <span class="current-position">{{ currentIndex + 1 }} / {{ totalCount }}</span>
        <span class="report-title">{{ report?.title || '로딩 중...' }}</span>
        <div class="keyboard-hints">
          <span class="hint">← → 키로 이동</span>
          <span class="hint">← Backspace로 목록</span>
        </div>
      </div>
      
      <button 
        @click="goToNext" 
        :disabled="!prevNext.next"
        class="nav-btn nav-next"
        title="다음 조황정보 (→)"
      >
        <span class="nav-text">다음</span>
        <i v-if="prevNext.next" class="fas fa-chevron-right"></i>
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> 로딩 중...
    </div>

    <div v-else-if="!report" class="error">
      조황정보를 찾을 수 없습니다.
    </div>

    <div v-else class="detail-content">
      <!-- 기본 정보 섹션 -->
      <div class="info-section">
        <h3>기본 정보</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>제목</label>
            <span>{{ report.title }}</span>
          </div>
          <div class="info-item">
            <label>작성자</label>
            <span>{{ report.user?.nickname || '알 수 없음' }}</span>
          </div>
          <div class="info-item">
            <label>낚시 날짜</label>
            <span>{{ formatDate(report.fishingAt) }}</span>
          </div>
          <div class="info-item">
            <label>등록일</label>
            <span>{{ formatDateTime(report.createdAt) }}</span>
          </div>
          <div class="info-item">
            <label>위치</label>
            <span>{{ report.location || '-' }}</span>
          </div>
          <div class="info-item">
            <label>날씨</label>
            <span>{{ report.weather || '-' }}</span>
          </div>
          <div class="info-item">
            <label>기온</label>
            <span>{{ report.temperature ? `${report.temperature}°C` : '-' }}</span>
          </div>
          <div class="info-item">
            <label>수온</label>
            <span>{{ report.waterTemperature ? `${report.waterTemperature}°C` : '-' }}</span>
          </div>
          <div class="info-item">
            <label>낚시 방법</label>
            <span>{{ report.fishingMethod || '-' }}</span>
          </div>
          <div class="info-item">
            <label>어획 정보</label>
            <span>{{ report.catchInfo || '-' }}</span>
          </div>
          <div class="info-item">
            <label>연관 상품</label>
            <span>{{ report.prodName || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 내용 섹션 -->
      <div class="content-section">
        <h3>상세 내용</h3>
        <div class="content-body" v-html="convertContentImageUrls(report.content)"></div>
      </div>
      <!-- 이미지 섹션 -->
      <div v-if="report.images && report.images.length > 0" class="images-section">
        <h3>이미지 ({{ report.images.length }}장)</h3>
        <div class="image-gallery">
          <div v-for="image in report.images" :key="image.id" class="image-item">
            <img 
              :src="
                image.imageData 
                  ? `data:image/jpeg;base64,${image.imageData}` 
                  : image.thumbnail
                    ? image.thumbnail
                    : image.imageUrl
              " 
              :alt="image.imageName" 
              @click="openImageModal(image)"
            >
            <div class="image-info">
              <span class="image-name">{{ image.imageName }}</span>
              <span v-if="image.thumbnail" class="thumbnail-badge">대표</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div class="comments-section">
        <h3>댓글 ({{ report.comments?.length || 0 }}개)</h3>
        
        <div v-if="report.comments && report.comments.length > 0" class="comments-list">
          <div v-for="comment in report.comments" :key="comment.frCommentId || comment.id || comment.frCommentId" class="comment-item">
            <div class="comment-header">
              <div class="comment-author-info">
                <span class="comment-author">{{ comment.user?.nickname || comment.user?.uname || comment.user?.name || '알 수 없음' }}</span>
                <span v-if="comment.user?.uid || comment.user?.uno" class="comment-user-id">
                  (ID: {{ comment.user.uid || comment.user.uno }})
                </span>
              </div>
              <span class="comment-date">{{ formatDateTime(comment.createdAt) }}</span>
            </div>
            <div class="comment-content">{{ comment.comment || comment.content || comment.text }}</div>
            <div class="comment-actions">
              <button 
                @click="deleteComment(comment.frCommentId || comment.id)" 
                class="btn-delete-comment"
                title="댓글 삭제"
              >
                <i class="fas fa-trash"></i> 삭제
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="no-comments">
          <i class="fas fa-comments"></i>
          <p>등록된 댓글이 없습니다.</p>
        </div>
      </div>

      <!-- 통계 정보 -->
      <div class="stats-section">
        <h3>통계 정보</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ report.comments?.length || 0 }}</div>
            <div class="stat-label">댓글 수</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ report.images?.length || 0 }}</div>
            <div class="stat-label">이미지 수</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ report.viewCount || 0 }}</div>
            <div class="stat-label">조회 수</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 모달 -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button @click="closeImageModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        <img :src="selectedImage?.imageData ? `data:image/jpeg;base64,${selectedImage.imageData}` : selectedImage?.imageUrl" :alt="selectedImage?.imageName">
        <div class="image-modal-info">
          <h4>{{ selectedImage?.imageName }}</h4>
          <p v-if="selectedImage?.thumbnail">대표 이미지</p>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <h3>조황정보 삭제</h3>
        <p>정말로 이 조황정보를 삭제하시겠습니까?</p>
        <p class="warning">이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="btn-delete">삭제</button>
          <button @click="closeDeleteModal" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>

    <!-- 댓글 삭제 확인 모달 -->
    <div v-if="showCommentDeleteModal" class="modal-overlay" @click="closeCommentDeleteModal">
      <div class="modal-content" @click.stop>
        <h3>댓글 삭제</h3>
        <p>정말로 이 댓글을 삭제하시겠습니까?</p>
        <p class="warning">이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-actions">
          <button @click="confirmDeleteComment" class="btn-delete">삭제</button>
          <button @click="closeCommentDeleteModal" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/lib/axios'
import { convertContentImageUrls } from '@/utils/authUtils.js'

const route = useRoute()
const router = useRouter()

// 상태 관리
const loading = ref(false)
const report = ref(null)
const showImageModal = ref(false)
const showDeleteModal = ref(false)
const selectedImage = ref(null)

// 댓글 관련 상태
const showCommentDeleteModal = ref(false)
const commentToDelete = ref(null)

// 네비게이션 상태
const prevNext = ref({ prev: null, next: null });

// 메서드
const loadReport = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }

    const response = await axios.get(`/api/fishing-report/get/${route.params.frId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    report.value = response.data
    
    // 댓글 데이터 디버깅
    console.log('조황정보 상세 데이터:', report.value)
    console.log('댓글 데이터:', report.value?.comments)
    console.log('댓글 개수:', report.value?.comments?.length)
  } catch (error) {
    console.error('조황정보 로드 실패:', error)
    alert('조황정보를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// prev-next API 호출
const loadPrevNext = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/fishing-report/${route.params.frId}/prev-next`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    prevNext.value = res.data;
  } catch (e) {
    prevNext.value = { prev: null, next: null };
  }
};

// 이전/다음 이동
const goToPrevious = () => {
  if (prevNext.value.prev) {
    router.push(`/admin/fishing-reports/${prevNext.value.prev.frId}`);
  }
};
const goToNext = () => {
  if (prevNext.value.next) {
    router.push(`/admin/fishing-reports/${prevNext.value.next.frId}`);
  }
};

const goBack = () => {
  router.push('/admin/fishing-reports')
}

const editReport = () => {
  router.push(`/admin/fishing-reports/${route.params.frId}/edit`)
}

const deleteReport = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }

    await axios.delete(`/api/fishing-report/delete/${route.params.frId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    alert('조황정보가 삭제되었습니다.')
    router.push('/admin/fishing-reports')
  } catch (error) {
    console.error('조황정보 삭제 실패:', error)
    alert('조황정보 삭제에 실패했습니다.')
  } finally {
    closeDeleteModal()
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const openImageModal = (image) => {
  selectedImage.value = image
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR')
}

// 라우트 변경 감지
const handleRouteChange = async () => {
  await loadReport()
  await loadPrevNext()
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await loadReport()
  await loadPrevNext()
  
  // 키보드 이벤트 리스너 추가
  document.addEventListener('keydown', handleKeydown)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 키보드 이벤트 핸들러
const handleKeydown = (event) => {
  // ESC 키로 모달 닫기
  if (event.key === 'Escape') {
    if (showImageModal.value) {
      closeImageModal()
    }
    if (showDeleteModal.value) {
      closeDeleteModal()
    }
    return
  }
  
  // 모달이 열려있으면 다른 키보드 이벤트 무시
  if (showImageModal.value || showDeleteModal.value) {
    return
  }
  
  // 왼쪽 화살표 키: 이전 조황정보
  if (event.key === 'ArrowLeft' && prevNext.value.prev && !loading.value) {
    event.preventDefault()
    goToPrevious()
  }
  
  // 오른쪽 화살표 키: 다음 조황정보
  if (event.key === 'ArrowRight' && prevNext.value.next && !loading.value) {
    event.preventDefault()
    goToNext()
  }
  
  // Backspace 키: 목록으로 돌아가기
  if (event.key === 'Backspace' && !event.target.matches('input, textarea')) {
    event.preventDefault()
    goBack()
  }
}

// 라우트 변경 감지
watch(() => route.params.frId, handleRouteChange)

const deleteComment = (commentId) => {
  commentToDelete.value = commentId
  showCommentDeleteModal.value = true
}

const confirmDeleteComment = async () => {
  if (!commentToDelete.value) return
  
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }

    await axios.delete(`/api/fishing-report/comment/${commentToDelete.value}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    alert('댓글이 삭제되었습니다.')
    await loadReport() // 조황정보 다시 로드하여 댓글 목록 업데이트
    closeCommentDeleteModal()
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
    alert('댓글 삭제에 실패했습니다.')
  }
}

const closeCommentDeleteModal = () => {
  showCommentDeleteModal.value = false
  commentToDelete.value = null
}
</script>

<style scoped>
.fishing-report-detail {
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-back,
.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.btn-back {
  background: #95a5a6;
  color: white;
}

.btn-back:hover {
  background: #7f8c8d;
}

.btn-edit {
  background: #f39c12;
  color: white;
}

.btn-edit:hover {
  background: #e67e22;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

/* 네비게이션 바 */
.navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 100px;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.nav-btn:disabled {
  border-color: #bdc3c7;
  color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.nav-btn:disabled .fa-spinner {
  color: #bdc3c7;
}

.nav-prev {
  border-radius: 6px 0 0 6px;
}

.nav-next {
  border-radius: 0 6px 6px 0;
}

.nav-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  margin: 0 1rem;
}

.current-position {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}

.report-title {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
  max-width: 400px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.keyboard-hints {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.hint {
  font-size: 0.75rem;
  color: #95a5a6;
  background: #f8f9fa;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.detail-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.info-section,
.content-section,
.images-section,
.comments-section,
.stats-section {
  padding: 2rem;
  border-bottom: 1px solid #eee;
}

.info-section:last-child,
.content-section:last-child,
.images-section:last-child,
.comments-section:last-child,
.stats-section:last-child {
  border-bottom: none;
}

.info-section h3,
.content-section h3,
.images-section h3,
.comments-section h3,
.stats-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.info-item span {
  color: #2c3e50;
  font-size: 1rem;
}

.content-body {
  line-height: 1.6;
  color: #2c3e50;
}

.content-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1rem 0;
}

.content-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.content-body :deep(th),
.content-body :deep(td) {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

.content-body :deep(th) {
  background: #f8f9fa;
  font-weight: 600;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.image-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.image-item:hover {
  transform: scale(1.05);
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-info {
  padding: 0.5rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-name {
  font-size: 0.8rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thumbnail-badge {
  background: #3498db;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.comments-section {
  padding: 2rem;
  border-bottom: 1px solid #eee;
}

.comments-section:last-child {
  border-bottom: none;
}

.comments-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comments-section h3::before {
  content: '\f075';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: #3498db;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  position: relative;
  transition: all 0.3s ease;
}

.comment-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.comment-author-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.comment-author {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-user-id {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: normal;
}

.comment-date {
  font-size: 0.8rem;
  color: #7f8c8d;
  white-space: nowrap;
  flex-shrink: 0;
}

.comment-content {
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-delete-comment {
  padding: 0.25rem 0.75rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
}

.btn-delete-comment:hover {
  background: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
}

.no-comments {
  text-align: center;
  padding: 3rem 1rem;
  color: #7f8c8d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.no-comments i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  color: #95a5a6;
}

.no-comments p {
  margin: 0;
  font-size: 1.1rem;
  color: #7f8c8d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 이미지 모달 */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-close:hover {
  background: rgba(0,0,0,0.9);
}

.image-modal-content img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.image-modal-info {
  padding: 1rem;
  text-align: center;
}

.image-modal-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.image-modal-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 삭제 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  color: #2c3e50;
}

.warning {
  color: #e74c3c;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .navigation-bar {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .nav-btn {
    width: 100%;
    justify-content: center;
  }
  
  .nav-text {
    display: none;
  }
  
  .report-title {
    max-width: 100%;
  }
  
  .keyboard-hints {
    display: none;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .comment-date {
    align-self: flex-end;
  }
  
  .comment-content {
    font-size: 0.9rem;
  }
  
  .btn-delete-comment {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .comments-section {
    padding: 1rem;
  }
  
  .comment-item {
    padding: 1rem;
  }
}
</style> 