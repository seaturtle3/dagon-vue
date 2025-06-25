<script setup>
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";
import { partnerService } from '@/api/partner';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFishingReportStore } from '@/store/fishing-center/useFishingReportStore.js';

const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})

console.log('props 댓글 확인: ', props.report.comments)

// 신고 관련 상태
const showReportModal = ref(false);
const reportReason = ref('');
const reportTarget = ref(null);
const reportType = ref(''); // 'report' 또는 'comment'

// 현재 사용자 정보
const currentUser = ref(null);

// 현재 사용자가 조황정보 작성자인지 확인
const isOwnReport = computed(() => {
  return String(currentUser.value?.uno) === String(props.report?.user?.uno);
});

// 현재 사용자가 댓글 작성자인지 확인
const isOwnComment = (comment) => {
  if (!currentUser.value || !comment.user) return false;
  return String(currentUser.value.uno) === String(comment.user.uno);
};

// 사용자 정보 초기화
const initializeUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      currentUser.value = JSON.parse(userInfo);
      console.log('localStorage에서 사용자 정보 복원:', currentUser.value);
    }
    
    // userInfo에 uno가 없으면 토큰에서 추출
    if (!currentUser.value?.uno) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.uno) {
            currentUser.value = { ...currentUser.value, uno: payload.uno };
            console.log('토큰에서 uno 추출:', payload.uno);
          }
        } catch (tokenError) {
          console.log('토큰 디코딩 실패:', tokenError);
        }
      }
    }
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
  }
};

// 신고하기 버튼 클릭
const openReportModal = (target, type) => {
  // 자기 자신 신고 방지
  if (type === 'report' && isOwnReport.value) {
    alert('자기 자신의 게시글은 신고할 수 없습니다.');
    return;
  }
  if (type === 'comment' && isOwnComment(target)) {
    alert('자기 자신의 댓글은 신고할 수 없습니다.');
    return;
  }

  // 이미 신고한 게시글/댓글인지 확인
  const reportedItems = JSON.parse(localStorage.getItem('reportedItems') || '[]');
  const itemId = type === 'report' ? target.frId : target.frCommentId;
  const itemType = type === 'report' ? 'report' : 'comment';
  
  if (reportedItems.some(item => item.id === itemId && item.type === itemType)) {
    alert('이미 신고한 게시글/댓글입니다.');
    return;
  }

  reportTarget.value = target;
  reportType.value = type;
  showReportModal.value = true;
  reportReason.value = '';
};

// 신고 제출
const submitReport = async () => {
  if (!reportReason.value.trim()) {
    alert('신고 사유를 입력해주세요.');
    return;
  }

  try {
    if (reportType.value === 'report') {
      await partnerService.reportFishingReport(props.report.frId, reportReason.value);
      // 신고 성공 시 localStorage에 저장
      const reportedItems = JSON.parse(localStorage.getItem('reportedItems') || '[]');
      reportedItems.push({ id: props.report.frId, type: 'report' });
      localStorage.setItem('reportedItems', JSON.stringify(reportedItems));
    } else if (reportType.value === 'comment') {
      await partnerService.reportFishingReportComment(reportTarget.value.frCommentId, reportReason.value);
      // 신고 성공 시 localStorage에 저장
      const reportedItems = JSON.parse(localStorage.getItem('reportedItems') || '[]');
      reportedItems.push({ id: reportTarget.value.frCommentId, type: 'comment' });
      localStorage.setItem('reportedItems', JSON.stringify(reportedItems));
    }
    
    alert('신고가 접수되었습니다.');
    showReportModal.value = false;
    reportReason.value = '';
  } catch (error) {
    console.error('신고 실패:', error);
    
    // 서버에서 받은 에러 메시지가 있으면 사용
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert('신고 처리 중 오류가 발생했습니다.');
    }
  }
};

// 모달 닫기
const closeReportModal = () => {
  showReportModal.value = false;
  reportReason.value = '';
};

// 컴포넌트 마운트 시 사용자 정보 초기화
onMounted(() => {
  initializeUserInfo();

  console.log('✅ currentUser:', currentUser.value)
  console.log('✅ report.user:', props.report.user)
  console.log('✅ UID 비교 결과:', currentUser.value?.uno === props.report.user?.uno)
})

const router = useRouter();
const fishingReportStore = useFishingReportStore();

const goToEdit = () => {
  router.push(`/fishing-report/form/${props.report.frId}`);
};

const confirmDelete = async () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await fishingReportStore.deleteFishingReport(props.report.frId);
      alert('삭제되었습니다.');
      router.push('/fishing-report');
    } catch (e) {
      alert('삭제에 실패했습니다.');
    }
  }
};

const newComment = ref('');
const submittingComment = ref(false);

// 댓글 등록 함수
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('댓글 내용을 입력하세요.');
    return;
  }
  if (!currentUser.value?.uno) {
    alert('로그인 후 이용해 주세요.');
    return;
  }
  submittingComment.value = true;
  try {
    await partnerService.createFishingReportComment(props.report.frId, newComment.value, currentUser.value.uno);
    alert('댓글이 등록되었습니다.');
    newComment.value = '';
    // 댓글 목록 새로고침 (emit 또는 reload 필요)
    location.reload(); // 임시: 새로고침, 추후 emit 등으로 개선 가능
  } catch (e) {
    alert('댓글 등록에 실패했습니다.');
  } finally {
    submittingComment.value = false;
  }
};

// 댓글 삭제 함수
const deleteComment = async (commentId) => {
  if (!commentId) {
    alert('댓글 ID가 없습니다.');
    return;
  }
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await partnerService.deleteFishingReportComment(commentId);
    alert('삭제되었습니다.');
    location.reload(); // 또는 댓글 목록만 갱신
  } catch (e) {
    alert('삭제에 실패했습니다.');
  }
};
</script>

<template>
  <div class="detail-container card-style">
    <div v-if="isOwnReport" class="detail-actions">
      <button class="btn btn-edit" @click="goToEdit">수정</button>
      <button class="btn btn-delete" @click="confirmDelete">삭제</button>
    </div>
    <!-- 제목 -->
    <div class="detail-title-row">
      <h2 class="detail-title">{{ report.title }}</h2>
      <button
        class="btn-report-post"
        @click="openReportModal(report, 'report')"
        title="게시글 신고"
      >
        <i class="fas fa-flag"></i> 신고
      </button>
    </div>
    <div class="meta-row">
      <span class="meta-item">
        <i class="fa fa-user"></i> {{ report.user?.uname || '익명' }}
      </span>
      <span class="meta-item">
        <i class="fa fa-calendar"></i> {{ report.fishingAt || '날짜 없음' }}
      </span>
      <span class="meta-item">
        <i class="fa fa-tag"></i>
        <router-link
          v-if="report.product && report.product.prodId"
          :to="`/products/${report.product.prodId}`"
          class="product-link"
        >
          {{ report.product.prodName }}
        </router-link>
        <span v-else>없음</span>
      </span>
    </div>

    <div class="thumbnail-section">
      <img
        class="thumbnail-img"
        :src="`${IMAGE_BASE_URL}${report.thumbnailUrl}`"
        alt="썸네일"
      />
    </div>

    <div class="content-section">
      <div class="content-text" v-html="report.content"></div>
    </div>

    <div v-if="report.imageUrls && report.imageUrls.length" class="report-images">
      <h5 class="section-label">추가 사진</h5>
      <div class="image-list">
        <img
          v-for="(img, index) in report.imageUrls"
          :key="index"
          :src="`${IMAGE_BASE_URL}${img}`"
          class="extra-image"
          alt="조황 사진"
        />
      </div>
    </div>

    <div class="comment-box">
      <h5 class="section-label">댓글</h5>
      <!-- 댓글 입력란: 항상 노출 -->
      <div class="comment-input-row">
        <textarea
          v-model="newComment"
          class="comment-input"
          placeholder="댓글을 입력하세요..."
          rows="2"
          :disabled="submittingComment"
        ></textarea>
        <button
          class="btn btn-primary comment-submit-btn"
          @click="submitComment"
          :disabled="submittingComment"
        >
          {{ submittingComment ? '등록 중...' : '등록' }}
        </button>
      </div>
      <div v-if="report.comments && report.comments.length">
        <div
          v-for="(comment, index) in report.comments"
          :key="comment.frCommentId"
          class="comment-item"
        >
          <div class="comment-meta">
            <span class="comment-user">{{ comment.user?.uname || '익명' }}</span>
            <span class="comment-date">{{ comment.createdAt }}</span>
          </div>
          <div class="comment-content">{{ comment.comment }}</div>
          <div class="comment-actions-row">
            <button
              v-if="!isOwnComment(comment)"
              class="btn-action-comment"
              @click="openReportModal(comment, 'comment')"
              :disabled="submittingComment"
              title="댓글 신고"
            >
              <i class="fas fa-flag"></i>신고
            </button>
            <button
              v-if="isOwnComment(comment)"
              class="btn-action-comment"
              @click="deleteComment(comment.frCommentId)"
              :disabled="submittingComment"
              title="댓글 삭제"
            >
              <i class="fa-solid fa-x"></i>삭제
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-comment">아직 등록된 댓글이 없습니다.</div>
    </div>
  </div>

  <!-- 신고 모달 -->
  <div v-if="showReportModal" class="modal-overlay" @click="closeReportModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">신고하기</h5>
        <button type="button" class="btn-close" @click="closeReportModal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label for="reportReason" class="form-label">신고 사유</label>
          <textarea
            id="reportReason"
            v-model="reportReason"
            class="form-control"
            rows="4"
            placeholder="신고 사유를 입력해주세요..."
          ></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeReportModal">취소</button>
        <button type="button" class="btn btn-danger" @click="submitReport">신고하기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container.card-style {
  max-width: 1280px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 36px 48px 32px 48px;
  position: relative;
}
.detail-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}
.detail-title {
  flex: 1;
  text-align: center;
  margin: 0;
  color: #1976d2;
}
.meta-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 18px;
  color: #666;
  font-size: 1rem;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.product-link {
  color: #1976d2;
  text-decoration: underline;
  font-weight: 500;
}
.thumbnail-section {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}
.thumbnail-img {
  width: 340px;
  height: 220px;
  object-fit: cover;
  border-radius: 10px;
  border: 1.5px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}
.content-section {
  margin-bottom: 32px;
  padding: 24px 18px;
  background: #f8f9fa;
  border-radius: 10px;
  min-height: 120px;
  font-size: 1.08rem;
  color: #222;
  line-height: 1.7;
  word-break: break-all;
  overflow-x: auto;
}
.content-text {
  min-height: 80px;
}
.content-text img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 18px auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}
.section-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 10px;
}
.report-images {
  margin-bottom: 32px;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.extra-image {
  width: 140px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 4px rgba(25, 118, 210, 0.07);
}
.comment-box {
  background: #f4f7fb;
  border-radius: 10px;
  padding: 22px 18px;
  margin-top: 18px;
  border: 1.5px solid #e3f2fd;
}
.comment-item {
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}
.comment-meta {
  display: flex;
  gap: 12px;
  font-size: 0.98rem;
  color: #1976d2;
  margin-bottom: 4px;
}
.comment-user {
  font-weight: 600;
}
.comment-date {
  color: #888;
  font-size: 0.93rem;
}
.comment-content {
  color: #222;
  font-size: 1.05rem;
  margin-left: 2px;
}
.no-comment {
  color: #888;
  text-align: center;
  padding: 18px 0 6px 0;
}
@media (max-width: 1100px) {
  .detail-container.card-style {
    max-width: 98vw;
    padding: 18px 4vw 18px 4vw;
  }
}
@media (max-width: 600px) {
  .detail-title {
    font-size: 1.3rem;
  }
  .meta-row {
    flex-direction: column;
    gap: 6px;
    font-size: 0.98rem;
    align-items: flex-start;
  }
  .thumbnail-img {
    height: 120px;
  }
  .content-section {
    padding: 12px 4px;
    font-size: 0.98rem;
  }
  .image-list {
    gap: 6px;
  }
  .extra-image {
    width: 80px;
    height: 60px;
  }
  .comment-box {
    padding: 10px 4px;
  }
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
  font-weight: 600;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background-color: #f8f9fa;
  border-radius: 4px;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 10px;
}
.btn-edit, .btn-delete {
  padding: 6px 16px;
  border-radius: 4px;
  font-weight: 600;
}
.btn-edit {
  background: #1976d2;
  color: #fff;
  border: none;
}
.btn-delete {
  background: #f44336;
  color: #fff;
  border: none;
}

/* 댓글 입력란 스타일 */
.comment-input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  align-items: flex-start;
}
.comment-input {
  flex: 1;
  border-radius: 6px;
  border: 1.5px solid #b0bec5;
  padding: 10px;
  font-size: 1rem;
  resize: vertical;
  min-height: 38px;
  max-height: 90px;
  background: #fff;
  transition: border 0.2s;
}
.comment-input:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}
.comment-submit-btn {
  min-width: 80px;
  height: 38px;
  border-radius: 6px;
  background: #1976d2;
  color: #fff;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.comment-submit-btn:disabled {
  background: #b0bec5;
  cursor: not-allowed;
}
.comment-submit-btn:hover:not(:disabled) {
  background: #1251a3;
}

/* 스타일 추가 */
.btn-report-post {
  background: #fff0f0;
  color: #e74c3c;
  border: 1.5px solid #e74c3c;
  border-radius: 6px;
  padding: 6px 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  vertical-align: middle;
  transition: background 0.2s, color 0.2s;
}
.btn-report-post i {
  font-size: 1.1em;
  margin-right: 4px;
  vertical-align: middle;
}
.btn-report-post:hover {
  background: #e74c3c;
  color: #fff;
}
.comment-actions-row {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
}
.btn-action-comment {
  background: #fff0f0;
  color: #e74c3c;
  border: 1.5px solid #e74c3c;
  border-radius: 6px;
  padding: 4px 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.98rem;
  transition: background 0.2s, color 0.2s;
}
.btn-action-comment:disabled {
  background: #f8d7da;
  color: #b0bec5;
  border-color: #f8d7da;
  cursor: not-allowed;
}
.btn-action-comment:hover:not(:disabled) {
  background: #e74c3c;
  color: #fff;
}
</style>
