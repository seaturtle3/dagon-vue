<script setup>
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js"

const props = defineProps({
  product: {
    type: Object,
    required: true,
  }
})

// console.log('ProductInfo props product:', props.product)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function onContactClick() {
  alert('문의 기능은 준비 중입니다!')
}

</script>

<template>
  <div>
    <div class="mb-5" style="text-align: center">
      <h2>배 상품 상세페이지</h2>
    </div>

    <div class="info-container">
      <!-- 썸네일 영역 -->
      <div class="thumbnail-wrapper">
        <img
            :src="`${IMAGE_BASE_URL}/${props.product.prodThumbnail}`"
            class="thumbnail"
            alt="썸네일"
        />
      </div>

      <!-- 텍스트 정보 영역 -->
      <div class="info-text">
        <div class="title-row">
          <h1 class="title">{{ props.product.prodName }}</h1>
          <button @click="onContactClick" class="inquiry-button">1:1 문의</button>
        </div>

        <p>지역: {{ props.product.prodRegion }}</p>
        <p>메인타입: {{ props.product.mainType }}</p>
        <p>서브타입: {{ props.product.subType }}</p>
        <p>최대인원: {{ props.product.maxPerson }}</p>
        <p>최소인원: {{ props.product.minPerson }}</p>
        <p>배 무게: {{ props.product.weight }}</p>
        <p>배 주소: {{ props.product.prodAddress }}</p>
        <p>배 정보: {{ props.product.prodDescription }}</p>
        <p>등록일: {{ formatDate(props.product.createdAt) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: flex-start;
  width: 100%; /* 전체 폭 차지 */
}

.thumbnail-wrapper {
  flex: 0 0 60%;
  display: flex;
}

.thumbnail {
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  height: 400px; /* 고정 높이 */
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 400px; /* 썸네일 높이와 동일하게 설정 */
  overflow-y: auto; /* 내용이 많으면 스크롤 */
  padding-right: 8px; /* 스크롤 생겨도 오른쪽 여백 생기게 */
  padding-left: 30px; /* 썸네일과 간격 */
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0; /* 기본 h1 마진 제거 */
  line-height: 1.2; /* 글자 위아래 높이 안정화 */
}

/* 🔥 타이틀과 버튼을 수평 정렬 */
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}

.inquiry-button {
  background-color: white; /* Tailwind: blue-200 */
  padding: 6px 14px; /* 약간 줄여서 중앙 정렬 느낌 맞춤 */
  font-size: 0.9rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.inquiry-button:hover {
  background-color: #93c5fd; /* Tailwind: blue-300 */
}
</style>

