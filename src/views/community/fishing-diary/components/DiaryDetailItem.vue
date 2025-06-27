<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js";
import { partnerService } from '@/api/partner';
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  diary: {
    type: Object,
    required: true
  }
})

// 신고 관련 상태
const showReportModal = ref(false);
const reportReason = ref('');
const reportTarget = ref(null);
const reportType = ref(''); // 'diary' 또는 'comment'

// 현재 사용자 정보
const currentUser = ref(null);

// 현재 사용자가 조행기 작성자인지 확인
const isOwnDiary = computed(() => {
  if (!currentUser.value || !props.diary.user) return false;
  return currentUser.value.uid === props.diary.user.uid;
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
  if (type === 'diary' && isOwnDiary.value) {
    alert('자기 자신의 게시글은 신고할 수 없습니다.');
    return;
  }
  if (type === 'comment' && isOwnComment(target)) {
    alert('자기 자신의 댓글은 신고할 수 없습니다.');
    return;
  }

  // 이미 신고한 게시글/댓글인지 확인
  const reportedItems = JSON.parse(localStorage.getItem('reportedItems') || '[]');
  const itemId = type === 'diary' ? target.fdId : target.fdCommentId;
  const itemType = type === 'diary' ? 'diary' : 'comment';
  
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
    if (reportType.value === 'diary') {
      await partnerService.reportFishingPost(props.diary.fdId, reportReason.value);
      // 신고 성공 시 localStorage에 저장
      const reportedItems = JSON.parse(localStorage.getItem('reportedItems') || '[]');
      reportedItems.push({ id: props.diary.fdId, type: 'diary' });
      localStorage.setItem('reportedItems', JSON.stringify(reportedItems));
    } else if (reportType.value === 'comment') {
      const commentId = reportTarget.value.fdCommentId || reportTarget.value.frCommentId;
      if (!commentId) {
        throw new Error('댓글 ID가 없습니다.');
      }
      await partnerService.reportFishingPostComment(commentId, reportReason.value);
      // 신고 성공 시 localStorage에 저장
      const reportedItems = JSON.parse(localStorage.getItem('reportedItems') || '[]');
      reportedItems.push({ id: commentId, type: 'comment' });
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
    } else if (error.message) {
      alert(error.message);
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
});

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
    await partnerService.createFishingDiaryComment(props.diary.fdId, newComment.value, currentUser.value.uno);
    alert('댓글이 등록되었습니다.');
    newComment.value = '';
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
    await partnerService.deleteFishingDiaryComment(commentId);
    alert('삭제되었습니다.');
    location.reload(); // 또는 댓글 목록만 갱신
  } catch (e) {
    alert('삭제에 실패했습니다.');
  }
};
</script>

<template>
  <div class="detail-container">
    <!-- 제목 -->
    <div class="detail-title-row">
      <h2 class="detail-title text-center mb-4 fw-bold">{{ diary.title }}</h2>
      <button
        v-if="!isOwnDiary"
        class="btn-report-post"
        @click="openReportModal(diary, 'diary')"
        title="게시글 신고"
      >
        <i class="fas fa-flag"></i> 신고
      </button>
    </div>

    <!-- 구분선 -->
    <hr class="my-4" />

    <!-- 썸네일 + 정보 -->
    <div class="d-flex flex-column flex-md-row align-items-start mb-4 position-relative">
      <!-- 썸네일 -->
      <img
          class="thumbnail rounded"
          :src="`${IMAGE_BASE_URL}/fishing-diary/${diary.thumbnailUrl}`"
          alt="썸네일"
      />

      <!-- 우측 정보 -->
      <div class="info-section ms-md-4 mt-3 mt-md-0">
        <p class="mb-3">
          <router-link
              v-if="diary.product && diary.product.prodId"
              :to="`/products/${diary.product.prodId}`"
              class="text-blue-600 hover:underline"
              style="font-size: 1.5rem;"
          >
            <strong>{{ diary.product.prodName }}</strong>
          </router-link>
          <strong v-else style="font-size: 1.5rem;">없음</strong>
        </p>
        <p><strong>작성자:</strong> {{ diary.user?.uname || '익명' }}</p>
        <p><strong>작성일:</strong> {{ diary.fishingAt || '날짜 없음' }}</p>
      </div>
    </div>

    <!-- 조행기 내용 -->
    <div class="content mb-4">
      <div class="content-text" v-html="diary.content"></div>
    </div>

    <!-- 추가 이미지 예시 (필요시 확장 가능) -->
    <div v-if="diary.imageUrls && diary.imageUrls.length" class="diary-images mt-3">
      <h5 class="fw-semibold mb-2">사진</h5>
      <div class="d-flex flex-wrap gap-3">
        <img
            v-for="(img, index) in diary.imageUrls"
            :key="index"
            :src="`${IMAGE_BASE_URL}/fishing-diary/${img}`"
            class="extra-image rounded"
            alt="조행기 사진"
        />
      </div>
    </div>
  </div>

  <!-- 댓글 박스 -->
  <div class="comment-box p-4 mt-5 rounded">
    <h5 class="mb-3 fw-semibold">댓글</h5>
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
    <div v-if="diary.comments && diary.comments.length">
      <div
          v-for="(comment, index) in diary.comments"
          :key="comment.fdCommentId"
          class="comment-item"
      >
        <!-- 댓글 작성자 -->
        <div class="comment-meta">
          <span class="comment-user">{{ comment.user?.uname || '익명' }}</span>
          <span class="comment-date">{{ comment.createdAt }}</span>
        </div>
        <!-- 댓글 내용 -->
        <div class="comment-content">{{ comment.comment }}</div>
        <!-- 댓글 렌더링 부분 -->
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
    <p class="text-muted" v-else>아직 등록된 댓글이 없습니다.</p>
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
.detail-container {
  max-width: 900px;
  margin: 0 auto;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.thumbnail {
  width: 300px;
  height: auto;
  object-fit: cover;
  border: 1px solid #ccc;
}

.info-section p {
  margin-bottom: 0.4rem;
}

.content .content-text {
  white-space: pre-line;
  line-height: 10;
}

.extra-image {
  width: 180px;
  height: 120px;
  object-fit: cover;
  border: 1px solid #ddd;
}

.comment-box {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  max-width: 900px;
  margin: 0 auto; /* 중앙 정렬 */
}

.user-name > p {
  margin-bottom: 0;
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

/* 스타일 추가 */
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
.comment-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.08);
  padding: 1.2rem 1.2rem 0.8rem 1.2rem;
  margin-bottom: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  color: #1976d2;
  margin-bottom: 2px;
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
  margin-bottom: 0.5rem;
  word-break: break-all;
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

/* 스타일 추가 (조황정보와 동일) */
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
</style>
