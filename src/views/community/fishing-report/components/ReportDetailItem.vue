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
  },
  currentUser: {
    type: Object,
    required: false,
    default: null
  }
})

console.log('props 댓글 확인: ', props.report.comments)

// 신고 관련 상태
const showReportModal = ref(false);
const reportReason = ref('');
const reportTarget = ref(null);
const reportType = ref(''); // 'report' 또는 'comment'

// 현재 사용자가 조황정보 작성자인지 확인
const isOwnReport = computed(() => {
  return String(props.currentUser?.uid) === String(props.report?.user?.uid);
});

// 현재 사용자가 댓글 작성자인지 확인
const isOwnComment = (comment) => {
  if (!props.currentUser || !comment.user) return false;
  return props.currentUser.uid === comment.user.uid;
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

const showImageModal = ref(false);
const modalImageIndex = ref(0);

function openImageModal(index) {
  modalImageIndex.value = index;
  showImageModal.value = true;
}
function closeImageModal() {
  showImageModal.value = false;
}
function prevImage() {
  if (modalImageIndex.value > 0) {
    modalImageIndex.value--;
  }
}
function nextImage() {
  if (modalImageIndex.value < (props.report.images.length - 1)) {
    modalImageIndex.value++;
  }
}
</script>

<template>
  <div class="detail-container card-style">
    <div v-if="isOwnReport" class="detail-actions">
      <button class="btn btn-edit" @click="goToEdit">수정</button>
      <button class="btn btn-delete" @click="confirmDelete">삭제</button>
    </div>
    <!-- 제목 -->
    <h2 class="detail-title">{{ report.title }}</h2>
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
        :src="
          report.images && report.images.length
            ? (
                report.images[0].imageData
                  ? `data:image/jpeg;base64,${report.images[0].imageData}`
                  : (report.images[0].image_data
                      ? `data:image/jpeg;base64,${report.images[0].image_data}`
                      : (report.images[0].imageUrl
                          ? report.images[0].imageUrl
                          : (report.images[0].image_url
                              ? report.images[0].image_url
                              : '/images/no-image.png'
                            )
                        )
                    )
              )
            : '/images/no-image.png'
        "
        alt="썸네일"
      />
    </div>

    <div class="content-section">
      <div class="content-text" v-html="report.content"></div>
    </div>

    <div v-if="report.images && report.images.length" class="report-images">
      <h5 class="section-label">추가 사진</h5>
      <div class="image-list">
        <img
          v-for="(img, index) in report.images"
          :key="index"
          :src="
            img.imageData
              ? `data:image/jpeg;base64,${img.imageData}`
              : (img.image_data
                  ? `data:image/jpeg;base64,${img.image_data}`
                  : (img.imageUrl
                      ? img.imageUrl
                      : (img.image_url
                          ? img.image_url
                          : '/images/no-image.png'
                        )
                    )
                )
          "
          class="extra-image"
          alt="조황 사진"
          @click="openImageModal(index)"
          style="cursor:pointer"
        />
      </div>
    </div>

    <!-- 이미지 모달 -->
    <div v-if="showImageModal" class="modal-overlay" @click.self="closeImageModal">
      <div class="modal-image-content">
        <button v-if="modalImageIndex > 0" class="modal-nav-btn left" @click.stop="prevImage">&#8592;</button>
        <img
          :src="
            report.images[modalImageIndex].imageData
              ? `data:image/jpeg;base64,${report.images[modalImageIndex].imageData}`
              : (report.images[modalImageIndex].image_data
                  ? `data:image/jpeg;base64,${report.images[modalImageIndex].image_data}`
                  : (report.images[modalImageIndex].imageUrl
                      ? report.images[modalImageIndex].imageUrl
                      : (report.images[modalImageIndex].image_url
                          ? report.images[modalImageIndex].image_url
                          : '/images/no-image.png'
                        )
                    )
                )
          "
          class="modal-large-image"
          alt="큰 조황 사진"
        />
        <button v-if="modalImageIndex < report.images.length - 1" class="modal-nav-btn right" @click.stop="nextImage">&#8594;</button>
        <button class="modal-close-btn" @click="closeImageModal">×</button>
      </div>
    </div>

    <div class="comment-box">
      <h5 class="section-label">댓글</h5>
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
  max-width: 1040px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 36px 32px 32px 32px;
  position: relative;
}
.detail-title {
  font-size: 2.1rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 10px;
  text-align: center;
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
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-image-content {
  position: relative;
  background: #fff;
  border-radius: 10px;
  padding: 16px 48px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-large-image {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}
.modal-close-btn {
  position: absolute;
  top: 8px; right: 16px;
  background: none;
  border: none;
  font-size: 2.2rem;
  color: #333;
  cursor: pointer;
  z-index: 10;
}
.modal-close-btn:hover {
  color: #1976d2;
}
.modal-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(25, 118, 210, 0.8);
  color: #fff;
  border: none;
  font-size: 2.5rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.modal-nav-btn.left {
  left: 8px;
}
.modal-nav-btn.right {
  right: 8px;
}
.modal-nav-btn:hover {
  background: #1565c0;
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
</style>
