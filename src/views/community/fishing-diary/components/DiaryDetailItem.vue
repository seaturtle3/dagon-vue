<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js";
import { partnerService } from '@/api/partner';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFishingDiaryStore } from '@/store/fishing-center/useFishingDiaryStore.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
  editMode: Boolean,
  diary: {
    type: Object,
    required: true
  }
});

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

// 이미지 확대 모달 상태 및 핸들러 추가 (ReportDetailItem.vue 참고)
const showImageModal = ref(false);
const modalImages = ref([]); // 전체 이미지 배열
const modalImageIndex = ref(0); // 현재 인덱스

function getImageSrc(img) {
  // img가 null/undefined인 경우 기본 이미지 반환
  if (!img) {
    return '/images/no-image.png';
  }
  
  if (img.imageData) {
    return `data:image/jpeg;base64,${img.imageData}`;
  } else if (img.image_data) {
    return `data:image/jpeg;base64,${img.image_data}`;
  } else if (img.imageUrl) {
    return img.imageUrl;
  } else if (img.image_url) {
    return img.image_url;
  } else {
    return '/images/no-image.png';
  }
}

function openImageModal(img) {
  // diary.imageUrls 또는 diary.images 등에서 전체 배열과 인덱스 세팅
  let imagesArr = [];
  if (props.diary.images && props.diary.images.length) {
    imagesArr = props.diary.images;
  }
  modalImages.value = imagesArr;
  modalImageIndex.value = imagesArr.findIndex(i => getImageSrc(i) === getImageSrc(img));
  if (modalImageIndex.value === -1) modalImageIndex.value = 0;
  showImageModal.value = true;
}

function closeImageModal() {
  showImageModal.value = false;
  modalImageIndex.value = 0;
  modalImages.value = [];
}

function prevImage() {
  if (modalImages.value.length > 0) {
    modalImageIndex.value = (modalImageIndex.value - 1 + modalImages.value.length) % modalImages.value.length;
  }
}

function nextImage() {
  if (modalImages.value.length > 0) {
    modalImageIndex.value = (modalImageIndex.value + 1) % modalImages.value.length;
  }
}

function handleKeydown(e) {
  if (!showImageModal.value) return;
  if (e.key === 'ArrowLeft') {
    prevImage();
  } else if (e.key === 'ArrowRight') {
    nextImage();
  } else if (e.key === 'Escape') {
    closeImageModal();
  }
}

onMounted(() => {
  initializeUserInfo();
  window.addEventListener('keydown', handleKeydown);
});

const router = useRouter();
const fishingDiaryStore = useFishingDiaryStore();

function goToEdit() {
  router.push(`/fishing-diary/edit/${props.diary.fdId}`);
}

async function confirmDelete() {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await fishingDiaryStore.deleteFishingDiary(props.diary.fdId);
      alert('삭제되었습니다.');
      await fishingDiaryStore.fetchDiaries(0, fishingDiaryStore.size);
      router.push('/fishing-diary');
    } catch (e) {
      console.error('조행기 삭제 실패:', e);
      alert('삭제에 실패했습니다.');
    }
  }
}

// 날짜 형식 변환 함수
const formatDate = (dateString) => {
  if (!dateString) return '날짜 없음';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '날짜 없음';
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}. ${month}. ${day}`;
};
</script>

<template>
  <div class="detail-container card-style">
    <!-- 작성자만 수정/삭제 버튼 노출 -->
    <div v-if="isOwnDiary" class="detail-actions">
      <button class="btn btn-edit" @click="goToEdit">수정</button>
      <button class="btn btn-delete" @click="confirmDelete">삭제</button>
    </div>
    <!-- 제목 -->
    <div class="detail-title-row">
      <h2 class="detail-title">{{ diary.title }}</h2>
    </div>
    <div class="detail-title-row" style="display: flex; justify-content: flex-end;">
      <button
          v-if="!isOwnDiary"
          class="btn-report-post"
          @click="openReportModal(diary, 'diary')"
          title="게시글 신고"
      >
        <font-awesome-icon :icon="['fas', 'flag']" class="fa-icon" /> 신고
      </button>
    </div>

    <div class="info-thumbnail-layout">
      <div class="info-card">
        <!-- 상단: 제목과 라인 -->
        <div class="info-header">
          <h3 class="info-title">조행기 정보</h3>
          <div class="views-count">
            <font-awesome-icon :icon="['fas', 'eye']" class="fa-icon" />
            <span>{{ diary.views || 0 }}</span>
          </div>
        </div>
        
        <!-- 하단: 썸네일과 정보 -->
        <div class="content-layout">
          <!-- 좌측: 썸네일 -->
          <div class="thumbnail-section">
            <img
                class="thumbnail-img"
                :src="getImageSrc(diary.images?.[0])"
                alt="썸네일"
                @click="openImageModal(diary.images?.[0])"
                style="cursor: pointer;"
            />
          </div>

          <!-- 우측: 관련 정보 -->
          <div class="info-section">
            <div class="info-content">
              <div class="info-item">
                <div class="ship-name">{{ diary.product?.prodName || '없음' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <font-awesome-icon :icon="['fas', 'user']" class="fa-icon" />
                  작성자
                </div>
                <div class="info-value">{{ diary.user?.uname || '익명' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <font-awesome-icon :icon="['fas', 'calendar']" class="fa-icon" />
                  조행 날짜
                </div>
                <div class="info-value">{{ formatDate(diary.fishingAt) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <font-awesome-icon :icon="['fas', 'clock']" class="fa-icon" />
                  등록 날짜
                </div>
                <div class="info-value">{{ formatDate(diary.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 관련 상품 예약 버튼 -->
    <div v-if="diary.product && diary.product.prodId" class="reservation-section">
      <router-link
          :to="`/products/${diary.product.prodId}?tab=reservation`"
          class="reservation-btn"
      >
        <font-awesome-icon :icon="['fas', 'calendar-check']" class="fa-icon" />
        {{ diary.product.prodName }} 예약하기
      </router-link>
    </div>

    <!-- 조행기 내용 -->
    <div class="content-section">
      <div class="content-text" v-html="diary.content"></div>
    </div>

    <!-- 추가 이미지 -->
    <div v-if="diary.images && diary.images.length > 1" class="diary-images mt-3">
      <h5 class="section-label">사진</h5>
      <div class="d-flex flex-wrap gap-3">
        <img
          v-for="(img, index) in diary.images.slice(1)"
          :key="index"
          :src="getImageSrc(img)"
          class="extra-image rounded"
          alt="조행기 사진"
          @click="openImageModal(img)"
          style="cursor:pointer;"
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
          <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
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
            <font-awesome-icon :icon="['fas', 'flag']" class="fa-icon" />신고
          </button>
          <button
            v-if="isOwnComment(comment)"
            class="btn-action-comment"
            @click="deleteComment(comment.frCommentId)"
            :disabled="submittingComment"
            title="댓글 삭제"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" class="fa-icon" />삭제
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

  <!-- 이미지 확대 모달 -->
  <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
    <div class="modal-content image-slide-modal" @click.stop>
      <button v-if="modalImages.length > 1" @click.stop="prevImage" class="slide-arrow left-arrow">
        <span>&#60;</span>
      </button>
      <img :src="getImageSrc(modalImages[modalImageIndex])" alt="확대 이미지" class="slide-image" />
      <button v-if="modalImages.length > 1" @click.stop="nextImage" class="slide-arrow right-arrow">
        <span>&#62;</span>
      </button>
      <button class="btn-close" @click="closeImageModal">&times;</button>
      <div v-if="modalImages.length > 1" class="slide-index">
        {{ modalImageIndex + 1 }} / {{ modalImages.length }}
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
  color: black;
  font-size: 2.5rem;
}

.info-thumbnail-layout {
  margin-bottom: 28px;
}

.info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e3f2fd;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
  display: flex;
  flex-direction: column;
}

.content-layout {
  display: flex;
  gap: 50px;
  align-items: stretch;
}

.thumbnail-section {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
}

.info-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.info-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e3f2fd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-title {
  margin: 0;
  color: black;
  font-size: 1.3rem;
  font-weight: 500;
}

.views-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.views-count i {
  color: #1976d2;
  font-size: 1rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  justify-content: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  color: #666;
  font-weight: 600;
  font-size: 1rem;
}

.info-label i {
  color: #1976d2;
  width: 16px;
}

.ship-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  padding: 8px 0;
  margin-bottom: 8px;
}

.info-value {
  color: #333;
  font-size: 1rem;
  flex: 1;
}

.thumbnail-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.12);
  cursor: pointer;
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

.reservation-section {
  margin-bottom: 28px;
}

.reservation-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.reservation-btn:hover {
  background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.reservation-btn i {
  font-size: 1.3rem;
}

.extra-image {
  width: 180px;
  height: 120px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.extra-image:hover {
  transform: scale(1.05);
}

.comment-box {
  background: #f4f7fb;
  border-radius: 10px;
  padding: 22px 18px;
  margin-top: 18px;
  border: 1.5px solid #e3f2fd;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

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

/* 이미지 슬라이드 모달 스타일 */
.image-slide-modal {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent;
  box-shadow: none;
}

.slide-image {
  max-width: 100vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
}

.slide-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  font-size: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s, transform 0.2s;
}

.slide-arrow:hover {
  background: rgba(0,0,0,0.8);
  transform: translateY(-50%) scale(1.08);
}

.left-arrow {
  left: 10px;
}

.right-arrow {
  right: 10px;
}

.slide-index {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  background: rgba(0,0,0,0.4);
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 1rem;
  z-index: 2;
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
  .info-card {
    padding: 16px;
  }
  .content-layout {
    flex-direction: column;
    gap: 20px;
  }
  .thumbnail-section {
    flex: none;
  }
  .thumbnail-img {
    height: 120px;
  }
  .reservation-btn {
    padding: 14px 20px;
    font-size: 1.1rem;
  }
  .content-section {
    padding: 12px 4px;
    font-size: 0.98rem;
  }
  .comment-box {
    padding: 10px 4px;
  }
  .slide-arrow {
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
  }
  .btn-close {
    font-size: 1.5rem;
    top: 10px;
    right: 10px;
  }
  .slide-index {
    font-size: 0.95rem;
    bottom: 10px;
  }
}
</style>
