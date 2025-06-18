<script setup>
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";
import { partnerService } from '@/api/partner';
import { ref, computed, onMounted } from 'vue';

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
  if (!currentUser.value || !props.report.user) return false;
  return currentUser.value.uid === props.report.user.uid;
});

// 현재 사용자가 댓글 작성자인지 확인
const isOwnComment = (comment) => {
  if (!currentUser.value || !comment.user) return false;
  return currentUser.value.uid === comment.user.uid;
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
    } else if (reportType.value === 'comment') {
      // 댓글 신고 API가 있다면 여기에 추가
      console.log('댓글 신고:', reportTarget.value.frCommentId, reportReason.value);
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
});
</script>

<template>
  <div class="detail-container">
    <!-- 제목 -->
    <h2 class="text-center mb-4 fw-bold">{{ report.title }}</h2>

    <!-- 구분선 -->
    <hr class="my-4"/>

    <!-- 썸네일 + 정보 -->
    <div class="d-flex flex-column flex-md-row align-items-start mb-4 position-relative">
      <!-- 신고하기 버튼 -->
      <span
          v-if="!isOwnReport"
          class="position-absolute top-0 end-0 text-danger small"
          style="cursor: pointer; background-color: #f8d7da; padding: 1px 2px; border-radius: 4px;"
          @click="openReportModal(report, 'report')"
      >
      신고하기
      </span>
      <!-- 썸네일 -->
      <img
          class="thumbnail rounded"
          :src="`${IMAGE_BASE_URL}/fishing-report/${report.thumbnailUrl}`"
          alt="썸네일"
      />

      <!-- 우측 정보 -->
      <div class="info-section ms-md-4 mt-3 mt-md-0">
        <p><strong>상품명:</strong> {{ report.product?.prodName || '없음' }}</p>
        <p><strong>작성자:</strong> {{ report.user?.uname || '익명' }}</p>
        <p><strong>조행일자:</strong> {{ report.fishingAt || '날짜 없음' }}</p>
      </div>
    </div>

    <!-- 조황 내용 -->
    <div class="content mb-4">
      <p class="content-text">{{ report.content }}</p>
    </div>

    <!-- 추가 이미지 예시 (필요시 확장 가능) -->
    <div v-if="report.imageUrls && report.imageUrls.length" class="report-images mt-3">
      <h5 class="fw-semibold mb-2">사진</h5>
      <div class="d-flex flex-wrap gap-3">
        <img
            v-for="(img, index) in report.imageUrls"
            :key="index"
            :src="`${IMAGE_BASE_URL}/fishing-report/${img}`"
            class="extra-image rounded"
            alt="조황 사진"
        />
      </div>
    </div>
  </div>

  <!-- 댓글 박스 -->
  <div class="comment-box p-4 mt-5 rounded">
    <h5 class="mb-3 fw-semibold">댓글</h5>
    <div v-if="report.comments && report.comments.length">
      <div
          v-for="(comment, index) in report.comments"
          :key="comment.frCommentId"
          class="mb-2 position-relative"
      >
        <!-- 우측 상단 신고 버튼 -->
        <span
            v-if="!isOwnComment(comment)"
            class="position-absolute top-0 end-0 text-danger small"
            style="cursor: pointer; background-color: #f8d7da; padding: 1px 3px; border-radius: 4px; margin: 8px;"
            @click="openReportModal(comment, 'comment')"
        >
          신고하기
        </span>

        <!-- 댓글 작성자 -->
        <p class="text-muted mb-1">{{ comment.user?.uname || '익명' }}</p>

        <!-- 작성 시간 -->
        <small class="text-secondary">{{ comment.createdAt }}</small>

        <!-- 댓글 내용 -->
        <p class="mb-0 mt-1">{{ comment.comment }}</p>

        <hr class="my-2" v-if="index < report.comments.length - 1"/>
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
</style>
