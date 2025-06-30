<template>
  <div class="fishing-diary-detail">
    <div class="header">
      <h2>조황정보 상세</h2>
      <div class="header-actions">
        <button @click="goBack" class="btn-back">
          <i class="fas fa-question-circle"></i>
           목록으로
        </button>
        <button @click="showDeleteModal = true" class="btn-delete">
          <i class="fas fa-trash"></i> 삭제
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> 로딩 중...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
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
            <span>{{ report.user?.nickname || report.user?.uname || '알 수 없음' }}</span>
          </div>
          <div class="info-item">
            <label>작성일</label>
            <span>{{ formatDateTime(report.createdAt) }}</span>
          </div>
          <div class="info-item">
            <label>조황 날짜</label>
            <span>{{ formatDate(report.fishingAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 내용 섹션 -->
      <div class="content-section">
        <h3>상세 내용</h3>
        <div class="content-body" v-html="report.content"></div>
      </div>

      <!-- 이미지 섹션 -->
      <div v-if="report.images && report.images.length > 0" class="images-section">
        <h3>이미지 ({{ report.images.length }}장)</h3>
        <div class="image-gallery">
          <div v-for="image in report.images" :key="image.id || image.imageUrl" class="image-item">
            <img :src="getImageUrl(image)" :alt="image.imageName" @click="openImageModal(image)">
            <div class="image-info">
              <span class="image-name">{{ image.imageName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div class="comments-section">
        <h3>댓글 ({{ report.comments?.length || 0 }}개)</h3>
        <div v-if="report.comments && report.comments.length > 0" class="comments-list">
          <div v-for="comment in report.comments" :key="comment.frCommentId || comment.id" class="comment-item">
            <div class="comment-header">
              <div class="comment-author-info">
                <span class="comment-author">{{ comment.user?.nickname || comment.user?.uname || '알 수 없음' }}</span>
                <span v-if="comment.user?.uid || comment.user?.uno" class="comment-user-id">
                  (ID: {{ comment.user.uid || comment.user.uno }})
                </span>
              </div>
              <span class="comment-date">{{ formatDateTime(comment.createdAt) }}</span>
            </div>
            <div class="comment-content">{{ comment.comment || comment.content || comment.text }}</div>
            <div class="comment-actions">
              <button
                @click="openReportModal(comment.frCommentId)"
                class="btn-report-comment"
                :aria-label="'댓글 신고'"
                :disabled="reporting"
                title="댓글 신고"
              >
                <i class="fas fa-flag"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-comments">
          <i class="fas fa-comments"></i>
          <p>등록된 댓글이 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 이미지 모달 -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button @click="closeImageModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        <img :src="getImageUrl(selectedImage)" :alt="selectedImage?.imageName">
        <div class="image-modal-info">
          <h4>{{ selectedImage?.imageName }}</h4>
        </div>
      </div>
    </div>

    <!-- 댓글 신고 모달 -->
    <div v-if="showReportModal" class="modal-overlay">
      <div class="modal-content">
        <h3>댓글 신고</h3>
        <p>신고 사유를 입력해 주세요.</p>
        <textarea
          v-model="reportReason"
          rows="4"
          class="report-textarea"
          placeholder="신고 사유를 입력하세요"
          autofocus
        ></textarea>
        <div class="modal-actions">
          <button @click="confirmReportComment" class="btn-report" :disabled="reporting">
            {{ reporting ? '신고 중...' : '신고' }}
          </button>
          <button @click="closeReportModal" class="btn-cancel" :disabled="reporting">취소</button>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>조황정보 삭제</h3>
        <p>정말로 이 조황정보를 삭제하시겠습니까?</p>
        <p class="warning">이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="btn-delete">삭제</button>
          <button @click="showDeleteModal = false" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { partnerService } from '@/api/partner.js';
import { BASE_URL } from '@/constants/baseUrl.js';

// props로 fr_id를 받음
const props = defineProps({
  fr_id: {
    type: [String, Number],
    required: true
  }
});

const router = useRouter();
const report = ref(null);
const loading = ref(true);
const error = ref(null);
const showImageModal = ref(false);
const selectedImage = ref(null);

// 댓글 신고 관련
const showReportModal = ref(false);
const commentToReport = ref(null);
const reportReason = ref("");
const reporting = ref(false);

// 삭제 관련 상태
const showDeleteModal = ref(false);

// 이미지 URL 생성 함수
function getImageUrl(image) {
  if (!image) return '/images/default-product.jpg';
  
  if (image.imageData) {
    // base64 데이터가 있으면 직접 사용
    return `data:image/jpeg;base64,${image.imageData}`;
  } else if (image.imageUrl) {
    // imageUrl이 상대 경로인 경우 base URL과 결합
    if (image.imageUrl.startsWith('/')) {
      return `${BASE_URL}${image.imageUrl}`;
    }
    return image.imageUrl;
  }
  return '/images/default-product.jpg';
}

onMounted(async () => {
  await fetchReport();
});

async function fetchReport() {
  loading.value = true;
  error.value = null;
  try {
    // route.params.fr_id 대신 props.fr_id 사용
    const response = await partnerService.getFishingReportDetail(props.fr_id);
    report.value = response.data;
    
    // 댓글 데이터 디버깅
    if (report.value?.comments) {
      console.log('조황정보 댓글 데이터:', report.value.comments);
      report.value.comments.forEach((comment, index) => {
        console.log(`조황정보 댓글 ${index + 1}:`, comment);
        console.log(`조황정보 댓글 ${index + 1} 사용자 정보:`, comment.user);
      });
    }
  } catch (err) {
    console.error('조황정보 상세 조회 실패:', err);
    error.value = err.message || '알 수 없는 오류 발생';
  } finally {
    loading.value = false;
  }
}

// 댓글 데이터 watch로 콘솔 출력
watch(
  () => report.value?.comments,
  (comments) => {
    if (comments) {
      comments.forEach((comment) => {
        console.log('조황정보 댓글:', comment);
        console.log('조황정보 댓글 user:', comment.user);
      });
    }
  },
  { immediate: true }
);

function goBack() {
  router.back();
}

function openImageModal(image) {
  selectedImage.value = image;
  showImageModal.value = true;
}
function closeImageModal() {
  showImageModal.value = false;
  selectedImage.value = null;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}
function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR');
}

// 댓글 신고
function openReportModal(commentId) {
  commentToReport.value = commentId;
  reportReason.value = "";
  showReportModal.value = true;
}
async function confirmReportComment() {
  if (!commentToReport.value || !reportReason.value.trim()) {
    alert('신고 사유를 입력해 주세요.');
    return;
  }
  reporting.value = true;
  try {
    await partnerService.reportFishingReportComment(commentToReport.value, reportReason.value);
    alert('댓글이 신고되었습니다.');
    closeReportModal();
  } catch (err) {
    console.error('댓글 신고 실패:', err);
    alert('댓글 신고에 실패했습니다.');
  } finally {
    reporting.value = false;
  }
}
function closeReportModal() {
  showReportModal.value = false;
  commentToReport.value = null;
  reportReason.value = "";
}

async function confirmDelete() {
  if (!report.value?.frId && !props.fr_id) return;
  try {
    await partnerService.deleteFishingReport(report.value?.frId || props.fr_id);
    alert('조황정보가 삭제되었습니다.');
    router.push('/partner/market-info');
  } catch (error) {
    console.error('조황정보 삭제 실패:', error);
    alert('조황정보 삭제에 실패했습니다.');
  } finally {
    showDeleteModal.value = false;
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
/* FishingDiaryDetail.vue 스타일 복사 */
.fishing-diary-detail {
  padding: 1rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.header h2 {
  margin: 0;
  color: #1565c0;
  font-size: 1.8rem;
  font-weight: 700;
}
.header-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-back {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  color: white;
}
.btn-back:hover {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  transform: translateY(-2px);
}
.btn-delete {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ef5350 0%, #d32f2f 100%);
  color: white;
}
.btn-delete:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  transform: translateY(-2px);
}
.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: #1565c0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  margin: 1rem 0;
}
.detail-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.info-section,
.content-section,
.images-section,
.comments-section {
  padding: 2rem;
  border-bottom: 1px solid rgba(33, 150, 243, 0.1);
}
.info-section:last-child,
.content-section:last-child,
.images-section:last-child,
.comments-section:last-child {
  border-bottom: none;
}
.info-section h3,
.content-section h3,
.images-section h3,
.comments-section h3 {
  color: #1565c0;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  border-bottom: 3px solid #42a5f5;
  padding-bottom: 0.75rem;
  font-weight: 700;
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
.btn-report-comment {
  padding: 0.25rem 0.5rem;
  background: none;
  color: #f39c12;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.btn-report-comment:hover, .btn-report-comment:focus {
  background: #fff3e0;
  color: #e67e22;
}
.btn-report-comment:disabled {
  color: #ccc;
  cursor: not-allowed;
  background: none;
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
/* 신고 모달 */
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
.btn-cancel {
  background: #95a5a6;
  color: white;
}
.btn-cancel:hover {
  background: #7f8c8d;
}
.report-textarea {
  width: 100%;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 1rem;
  resize: vertical;
  min-height: 80px;
}
.btn-report {
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-report:disabled {
  background: #ffe0b2;
  color: #bdbdbd;
  cursor: not-allowed;
}
.btn-report:hover:not(:disabled) {
  background: #e67e22;
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
  .info-grid {
    grid-template-columns: 1fr;
  }
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
  .btn-report-comment {
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