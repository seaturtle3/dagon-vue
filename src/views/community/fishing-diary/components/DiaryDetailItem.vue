<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js";

const props = defineProps({
  diary: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="detail-container">
    <!-- 제목 -->
    <h2 class="text-center mb-4 fw-bold">{{ diary.title }}</h2>

    <!-- 구분선 -->
    <hr class="my-4" />

    <!-- 썸네일 + 정보 -->
    <div class="d-flex flex-column flex-md-row align-items-start mb-4 position-relative">
      <!-- 신고하기 버튼 -->
      <span
          class="position-absolute top-0 end-0 text-danger small"
          style="cursor: pointer; background-color: #f8d7da; padding: 1px 2px; border-radius: 4px;"
      >
      신고하기
      </span>

      <!-- 썸네일 -->
      <img
          class="thumbnail rounded"
          :src="`${IMAGE_BASE_URL}/fishing-diary/${diary.thumbnailUrl}`"
          alt="썸네일"
      />

      <!-- 우측 정보 -->
      <div class="info-section ms-md-4 mt-3 mt-md-0">
        <p><strong>상품명:</strong> {{ diary.product?.prodName || '없음' }}</p>
        <p><strong>작성자:</strong> {{ diary.user?.uname || '익명' }}</p>
        <p><strong>조행일자:</strong> {{ diary.fishingAt || '날짜 없음' }}</p>
      </div>
    </div>

    <!-- 조행기 내용 -->
    <div class="content mb-4">
      <p class="content-text">{{ diary.content }}</p>
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
    <div v-if="diary.comments && diary.comments.length">
      <div
          v-for="(comment, index) in diary.comments"
          :key="comment.fdCommentId"
          class="mb-2 position-relative"
      >
        <!-- 우측 상단 신고 버튼 -->
        <span
            class="position-absolute top-0 end-0 text-danger small"
            style="cursor: pointer; background-color: #f8d7da; padding: 1px 3px; border-radius: 4px; margin: 8px;"
        >
          신고하기
        </span>

        <!-- 댓글 작성자 -->
        <p class="text-muted user-name">{{ comment.user?.uname || '익명' }}</p>

        <!-- 작성 시간 -->
        <small class="d-block text-secondary mb-3">{{comment.createdAt}}</small>

        <!-- 댓글 내용 -->
        <p class="mb-1">{{ comment.comment }}</p>
        <hr class="my-2" v-if="index < diary.comments.length - 1" />
      </div>
    </div>

    <p class="text-muted" v-else>아직 등록된 댓글이 없습니다.</p>
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
</style>
